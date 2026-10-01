import React, { useState, useEffect } from 'react';
import {
  X,
  IndianRupee,
  Calendar,
  CreditCard,
  Hash,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { PaymentMethod, Payment } from '../../types';
import { formatINR } from '../../lib/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookingId?: string;
  initialCustomerId?: string;
  onSuccess?: (payment: Payment) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  initialBookingId,
  initialCustomerId,
  onSuccess,
}) => {
  const { db, state } = useSkySuite();

  const [bookingId, setBookingId] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialBookingId) {
      setBookingId(initialBookingId);
    } else if (state.bookings.length > 0) {
      setBookingId(state.bookings[0].id);
    }
  }, [initialBookingId, state.bookings, isOpen]);

  // When booking changes, auto-select first pending schedule or suggest amount
  useEffect(() => {
    if (!bookingId) return;
    const schedules = db.getPaymentSchedules(bookingId);
    const pendingSch = schedules.find((s) => s.status !== 'PAID');
    if (pendingSch) {
      setScheduleId(pendingSch.id);
      setAmount(pendingSch.amount);
    } else {
      setScheduleId('');
      const fin = db.getBookingFinancials(bookingId);
      if (fin.outstanding > 0) {
        setAmount(fin.outstanding);
      }
    }
  }, [bookingId, db]);

  if (!isOpen) return null;

  const currentBooking = state.bookings.find((b) => b.id === bookingId);
  const bookingFinancials = bookingId ? db.getBookingFinancials(bookingId) : null;
  const bookingSchedules = bookingId ? db.getPaymentSchedules(bookingId) : [];

  const paymentMethods: PaymentMethod[] = [
    'UPI',
    'CASH',
    'BANK_TRANSFER',
    'CARD',
    'CHEQUE',
    'OTHER',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !currentBooking || !amount || Number(amount) <= 0) return;

    const payment = db.addPayment({
      booking_id: bookingId,
      customer_id: currentBooking.customer_id,
      payment_schedule_id: scheduleId || undefined,
      amount: Number(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: referenceNumber || undefined,
      notes: notes || undefined,
    });

    if (onSuccess) onSuccess(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Record Client Payment</h2>
            <p className="text-[11px] text-neutral-500">
              Generate receipt, update milestone schedules, and reduce outstanding balance
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Booking Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Select Booking *
            </label>
            <select
              required
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
            >
              {state.bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_number} - {b.title} ({b.customer_name})
                </option>
              ))}
            </select>
          </div>

          {/* Outstanding Balance Banner */}
          {bookingFinancials && (
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/80 p-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Agreement</span>
                <span className="font-mono font-bold text-neutral-900">
                  {formatINR(bookingFinancials.total)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Previously Received</span>
                <span className="font-mono font-bold text-emerald-800">
                  {formatINR(bookingFinancials.received)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Current Outstanding</span>
                <span className="font-mono font-bold text-amber-800">
                  {formatINR(bookingFinancials.outstanding)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Schedule Milestone */}
          {bookingSchedules.length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Link to Payment Milestone (Optional)
              </label>
              <select
                value={scheduleId}
                onChange={(e) => {
                  setScheduleId(e.target.value);
                  const sel = bookingSchedules.find((s) => s.id === e.target.value);
                  if (sel) setAmount(sel.amount);
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="">No specific schedule / Custom installment</option>
                {bookingSchedules.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.title} ({formatINR(sch.amount)}) - [{sch.status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Amount Received (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono font-bold focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Payment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
              >
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Reference / UTR / Cheque No
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UPI/4021987..."
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Receipt Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received advance token via Google Pay"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Record & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

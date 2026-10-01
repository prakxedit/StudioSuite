import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Calendar, Tag, FileText, CreditCard } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { ExpenseCategory, PaymentMethod } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookingId?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  initialBookingId,
}) => {
  const { db, state } = useSkySuite();

  const [bookingId, setBookingId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Staff');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  useEffect(() => {
    if (initialBookingId) {
      setBookingId(initialBookingId);
    } else {
      setBookingId('');
    }
    setCategory('Staff');
    setDescription('');
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('UPI');
  }, [initialBookingId, isOpen]);

  if (!isOpen) return null;

  const categories: ExpenseCategory[] = [
    'Staff',
    'Travel',
    'Album',
    'Printing',
    'Equipment',
    'Food',
    'Fuel',
    'Other',
  ];

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
    if (!description.trim() || !amount || Number(amount) <= 0) return;

    const currentBooking = state.bookings.find((b) => b.id === bookingId);

    db.addExpense({
      booking_id: bookingId || undefined,
      booking_title: currentBooking?.title,
      category,
      description,
      amount: Number(amount),
      expense_date: expenseDate,
      payment_method: paymentMethod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Record Production Expense</h2>
            <p className="text-[11px] text-neutral-500">Track shoot costs, album printing & travel</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Associated Booking (Optional or selected) */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Link to Booking (Optional for General Studio Expenses)
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
            >
              <option value="">General Overhead / Unlinked Expense</option>
              {state.bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_number} - {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="3500"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono font-bold focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Canvera album printing & velvet binding fees"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Expense Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Paid Via *
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
          </div>

          {/* Actions */}
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
              className="rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

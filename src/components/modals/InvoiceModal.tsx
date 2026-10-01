import React, { useState, useEffect } from 'react';
import { X, Calendar, IndianRupee, FileText, CheckCircle2 } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Invoice, InvoiceStatus } from '../../types';
import { formatINR } from '../../lib/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
  initialBookingId?: string;
  onPreview: (invoice: Invoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceToEdit,
  initialBookingId,
  onPreview,
}) => {
  const { db, state, settings } = useSkySuite();

  const [bookingId, setBookingId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [subtotal, setSubtotal] = useState<number | string>(120000);
  const [discount, setDiscount] = useState<number | string>(0);
  const [taxPercent, setTaxPercent] = useState<number>(settings.default_tax || 0);
  const [status, setStatus] = useState<InvoiceStatus>('ISSUED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (invoiceToEdit) {
      setBookingId(invoiceToEdit.booking_id);
      setInvoiceDate(invoiceToEdit.invoice_date);
      setDueDate(invoiceToEdit.due_date);
      setSubtotal(invoiceToEdit.subtotal);
      setDiscount(invoiceToEdit.discount);
      const taxable = invoiceToEdit.subtotal - invoiceToEdit.discount;
      setTaxPercent(taxable > 0 ? Math.round((invoiceToEdit.tax / taxable) * 100) : 0);
      setStatus(invoiceToEdit.status);
      setNotes(invoiceToEdit.notes || '');
    } else {
      const bId = initialBookingId || state.bookings[0]?.id || '';
      setBookingId(bId);
      const selBooking = state.bookings.find((b) => b.id === bId);
      setSubtotal(selBooking ? selBooking.total_amount : 120000);
      setDiscount(0);
      setTaxPercent(settings.default_tax || 0);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split('T')[0]);
      setStatus('ISSUED');
      setNotes('');
    }
  }, [invoiceToEdit, initialBookingId, state.bookings, settings, isOpen]);

  if (!isOpen) return null;

  const currentBooking = state.bookings.find((b) => b.id === bookingId);
  const currentCustomer = currentBooking
    ? state.customers.find((c) => c.id === currentBooking.customer_id)
    : null;

  const numSub = Number(subtotal) || 0;
  const numDisc = Number(discount) || 0;
  const taxable = Math.max(0, numSub - numDisc);
  const taxAmount = Math.round(taxable * ((Number(taxPercent) || 0) / 100));
  const grandTotal = taxable + taxAmount;

  const buildPayload = (): Invoice => {
    const invNum = invoiceToEdit ? invoiceToEdit.invoice_number : db.generateInvoiceNumber();
    return {
      id: invoiceToEdit?.id || 'inv-' + Date.now(),
      organization_id: state.currentOrgId,
      invoice_number: invNum,
      invoice_date: invoiceDate,
      due_date: dueDate || invoiceDate,
      customer_id: currentCustomer?.id || currentBooking?.customer_id || '',
      customer_name: currentCustomer?.name || currentBooking?.customer_name || 'Client',
      booking_id: bookingId,
      booking_title: currentBooking?.title || 'Studio Production',
      subtotal: numSub,
      discount: numDisc,
      tax: taxAmount,
      total: grandTotal,
      status,
      notes,
      created_at: invoiceToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    const payload = buildPayload();
    if (invoiceToEdit) {
      db.updateInvoice(invoiceToEdit.id, payload);
    } else {
      db.addInvoice(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {invoiceToEdit ? `Edit Invoice (${invoiceToEdit.invoice_number})` : 'Generate Commercial Invoice'}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Issue GST-compliant or non-GST commercial bill for client booking
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
              onChange={(e) => {
                setBookingId(e.target.value);
                const sel = state.bookings.find((b) => b.id === e.target.value);
                if (sel) setSubtotal(sel.total_amount);
              }}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
            >
              {state.bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_number} - {b.title} ({b.customer_name})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Payment Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Subtotal, Discount, Tax Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Subtotal (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                GST Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
              />
              <span className="text-[10px] text-neutral-400 block mt-0.5">
                0% if not GST registered
              </span>
            </div>
          </div>

          {/* Grand Total Preview Card */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/80 p-3.5 text-xs font-mono">
            <div>
              <span className="text-neutral-500 block text-[11px] font-sans">Calculated Taxes</span>
              <span className="font-semibold text-neutral-800">{formatINR(taxAmount)}</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block text-[11px] font-sans">Final Invoice Total</span>
              <span className="text-base font-bold text-neutral-950">{formatINR(grandTotal)}</span>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ISSUED">ISSUED</option>
                <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional billing note..."
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => onPreview(buildPayload())}
              className="rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Preview & Print PDF
            </button>
            <div className="flex items-center gap-2">
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
                {invoiceToEdit ? 'Save Invoice' : 'Issue Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

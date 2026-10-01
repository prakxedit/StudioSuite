import React from 'react';
import { X, Printer, Share2, Camera, CheckCircle2 } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Payment } from '../../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../../lib/formatters';

interface ReceiptPrintViewProps {
  payment: Payment | null;
  onClose: () => void;
}

export const ReceiptPrintView: React.FC<ReceiptPrintViewProps> = ({
  payment,
  onClose,
}) => {
  const { currentOrg, settings, db, state } = useSkySuite();

  if (!payment) return null;

  const booking = state.bookings.find((b) => b.id === payment.booking_id);
  const customer = state.customers.find((c) => c.id === payment.customer_id);

  // Financial calculations for this payment:
  // All payments for this booking made ON OR BEFORE this payment's date/time
  const allBookingPayments = state.payments
    .filter((p) => p.booking_id === payment.booking_id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const thisPaymentIdx = allBookingPayments.findIndex((p) => p.id === payment.id);
  const previouslyReceived = allBookingPayments
    .slice(0, thisPaymentIdx >= 0 ? thisPaymentIdx : 0)
    .reduce((sum, p) => sum + p.amount, 0);

  const bookingTotal = booking?.total_amount || payment.amount;
  const cumulativePaid = previouslyReceived + payment.amount;
  const balanceDue = Math.max(0, bookingTotal - cumulativePaid);

  const handlePrint = () => {
    window.print();
  };

  const shareText = `Payment Receipt from ${currentOrg?.name}: Received ${formatINR(payment.amount)} via ${payment.payment_method} on ${formatDate(payment.payment_date)} for "${booking?.title}". Receipt: ${payment.receipt_number}. Balance due: ${formatINR(balanceDue)}. Thank you!`;
  const whatsappUrl = createWhatsAppUrl(customer?.phone || '', shareText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Top Floating Control Bar */}
      <div className="fixed top-4 right-4 z-60 flex items-center gap-2 print:hidden bg-neutral-900/90 p-2 rounded-xl border border-neutral-700 shadow-xl backdrop-blur-md">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors"
        >
          <Share2 className="h-4 w-4 text-emerald-400" />
          <span>Share WhatsApp</span>
        </a>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer shadow-xs"
        >
          <Printer className="h-4 w-4 text-neutral-800" />
          <span>Print / PDF</span>
        </button>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* The Printable Receipt Container */}
      <div className="w-full max-w-2xl rounded-xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-2xl my-8 text-neutral-900 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white">
                <Camera className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-950 uppercase">
                {currentOrg?.name || 'Sky Photography Studio'}
              </h1>
            </div>
            <p className="text-xs text-neutral-500">{currentOrg?.business_name}</p>
            <div className="text-[11px] text-neutral-500 leading-relaxed pt-0.5">
              <div>{currentOrg?.address || 'Indiranagar, Bengaluru, Karnataka'}</div>
              <div>Phone: {currentOrg?.phone} · Email: {currentOrg?.email}</div>
              {currentOrg?.gst_number && (
                <div className="font-mono text-neutral-700">GSTIN: {currentOrg.gst_number}</div>
              )}
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest block">
              PAYMENT RECEIPT
            </span>
            <div className="text-base font-bold text-neutral-950 font-mono">
              {payment.receipt_number}
            </div>
            <div className="text-xs text-neutral-500">
              Date: <span className="font-mono text-neutral-800 font-medium">{formatDate(payment.payment_date)}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3 w-3" />
              <span>Payment Confirmed</span>
            </div>
          </div>
        </div>

        {/* Client & Booking Particulars */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b border-neutral-100 text-xs">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Received With Thanks From:
            </span>
            <div className="text-sm font-bold text-neutral-900">
              {customer?.name || payment.customer_name}
            </div>
            <div className="text-neutral-600 font-mono mt-0.5">
              {customer?.phone || ''}
            </div>
            {customer?.address && (
              <div className="text-[11px] text-neutral-500 mt-0.5">{customer.address}</div>
            )}
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              For Booking / Contract:
            </span>
            <div className="text-sm font-bold text-neutral-900">
              {booking?.title || payment.booking_title}
            </div>
            <div className="font-mono text-neutral-500 text-[11px] mt-0.5">
              Ref: {booking?.booking_number || 'BK-2026'}
            </div>
          </div>
        </div>

        {/* Payment Amount Box */}
        <div className="my-6 rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Amount Received</span>
            <div className="text-2xl font-bold font-mono text-neutral-950 mt-0.5">
              {formatINR(payment.amount)}
            </div>
            <div className="text-xs text-neutral-600 mt-1">
              Payment Method: <span className="font-semibold text-neutral-900">{payment.payment_method}</span>
              {payment.reference_number && (
                <span className="font-mono ml-2 text-neutral-500">
                  (Ref: {payment.reference_number})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Outstanding & Ledger Breakdown */}
        <div className="border border-neutral-200 rounded-lg p-4 bg-white text-xs space-y-2 font-mono">
          <div className="text-[11px] font-bold font-sans text-neutral-500 uppercase tracking-wider mb-2">
            Commercial Account Summary
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Total Agreed Booking Value:</span>
            <span>{formatINR(bookingTotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Previously Received:</span>
            <span>{formatINR(previouslyReceived)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-1.5 font-bold text-emerald-800">
            <span>This Payment Received:</span>
            <span>{formatINR(payment.amount)}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-1.5 text-sm font-bold text-neutral-900">
            <span>Remaining Balance Due:</span>
            <span className={balanceDue > 0 ? 'text-amber-800' : 'text-neutral-900'}>
              {formatINR(balanceDue)}
            </span>
          </div>
        </div>

        {/* Footer Notes & Sign */}
        <div className="mt-8 pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8 text-[11px]">
          <div>
            <span className="font-bold text-neutral-700 block mb-1">Notes:</span>
            <p className="text-neutral-500 leading-relaxed">
              {payment.notes || 'Official electronic payment receipt generated by SkySuite Studio Management. Cheques subject to realization.'}
            </p>
          </div>
          <div className="flex flex-col justify-end text-right">
            <div className="mb-8 text-neutral-400">For {currentOrg?.name}</div>
            <div className="border-t border-neutral-300 pt-1 font-semibold text-neutral-800">
              Cashier / Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

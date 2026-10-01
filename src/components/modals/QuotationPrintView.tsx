import React from 'react';
import { X, Printer, Share2, CalendarCheck, Camera, Check } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Quotation } from '../../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../../lib/formatters';

interface QuotationPrintViewProps {
  quotation: Quotation | null;
  onClose: () => void;
  onConvertToBooking?: (quotationId: string) => void;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({
  quotation,
  onClose,
  onConvertToBooking,
}) => {
  const { currentOrg, settings } = useSkySuite();

  if (!quotation) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = `Hello ${quotation.customer_name}, please review your photography proposal for "${quotation.event_title}" (Quotation: ${quotation.quotation_number}) for a total of ${formatINR(quotation.total)}. Valid until ${formatDate(quotation.valid_until)}. Best regards, ${currentOrg?.name}.`;
  const whatsappUrl = createWhatsAppUrl(quotation.customer_phone, whatsappMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Top Floating Control Bar (Hidden during window.print) */}
      <div className="fixed top-4 right-4 z-60 flex items-center gap-2 print:hidden bg-neutral-900/90 p-2 rounded-xl border border-neutral-700 shadow-xl backdrop-blur-md">
        {onConvertToBooking && quotation.status !== 'ACCEPTED' && (
          <button
            onClick={() => onConvertToBooking(quotation.id)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Accept & Convert to Booking</span>
          </button>
        )}
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

      {/* The Printable Document Container */}
      <div className="w-full max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-2xl my-8 text-neutral-900 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Studio Brand Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white">
                <Camera className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-950 uppercase">
                {currentOrg?.name || 'Sky Photography Studio'}
              </h1>
            </div>
            <p className="text-xs text-neutral-500">{currentOrg?.business_name}</p>
            <div className="text-[11px] text-neutral-500 pt-1 leading-relaxed">
              <div>{currentOrg?.address || 'Signature Pinnacle, Indiranagar'}</div>
              <div>
                {currentOrg?.city || 'Bengaluru'}, {currentOrg?.state || 'Karnataka'} -{' '}
                {currentOrg?.pincode || '560038'}
              </div>
              <div>Phone: {currentOrg?.phone} · Email: {currentOrg?.email}</div>
              {currentOrg?.gst_number && (
                <div className="font-mono font-medium text-neutral-700">
                  GSTIN: {currentOrg.gst_number}
                </div>
              )}
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest block">
              ESTIMATE / PROPOSAL
            </span>
            <div className="text-lg font-bold text-neutral-950 font-mono">
              {quotation.quotation_number}
            </div>
            <div className="text-xs text-neutral-500">
              Date: <span className="font-mono text-neutral-800 font-medium">{formatDate(quotation.quotation_date)}</span>
            </div>
            <div className="text-xs text-neutral-500">
              Valid Until: <span className="font-mono text-neutral-800 font-medium">{formatDate(quotation.valid_until)}</span>
            </div>
          </div>
        </div>

        {/* Client & Project Details */}
        <div className="grid grid-cols-2 gap-4 py-6 border-b border-neutral-100 text-xs">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Proposal Prepared For:
            </span>
            <div className="text-sm font-bold text-neutral-900">{quotation.customer_name}</div>
            <div className="text-neutral-600 font-mono mt-0.5">{quotation.customer_phone}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Event / Project:
            </span>
            <div className="text-sm font-bold text-neutral-900">{quotation.event_title}</div>
            <div className="text-neutral-500 mt-0.5">Status: <span className="font-semibold text-neutral-800">{quotation.status}</span></div>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Scope of Coverage / Deliverable</th>
                <th className="py-2.5 text-right">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {quotation.items.map((itm, index) => (
                <tr key={itm.id || index}>
                  <td className="py-3 text-neutral-400 font-mono">{index + 1}</td>
                  <td className="py-3 pr-4">
                    <div className="font-bold text-neutral-900">{itm.service_name}</div>
                    {itm.description && (
                      <div className="text-[11px] text-neutral-500 font-normal mt-0.5 leading-snug">
                        {itm.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono">{itm.quantity}</td>
                  <td className="py-3 text-right font-mono">{formatINR(itm.unit_price)}</td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-900">
                    {formatINR(itm.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end border-t border-neutral-200 pt-4">
          <div className="w-64 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span>{formatINR(quotation.subtotal)}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Discount:</span>
                <span className="text-emerald-700 font-semibold">-{formatINR(quotation.discount)}</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Taxes (GST):</span>
                <span>{formatINR(quotation.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold text-neutral-950">
              <span>Total Quotation:</span>
              <span>{formatINR(quotation.total)}</span>
            </div>
          </div>
        </div>

        {/* Bank & Payment Details */}
        <div className="mt-8 rounded-lg border border-neutral-200 p-4 bg-neutral-50/60 text-xs">
          <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Payment & Bank Transfer Information
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-neutral-500 text-[11px]">Bank: <span className="font-semibold text-neutral-800">{settings.bank_name || 'HDFC Bank Ltd'}</span></div>
              <div className="text-neutral-500 text-[11px]">A/C Name: <span className="font-semibold text-neutral-800">{settings.account_name || currentOrg?.business_name}</span></div>
              <div className="text-neutral-500 text-[11px]">A/C No: <span className="font-mono font-semibold text-neutral-800">{settings.account_number || '50200034891234'}</span></div>
              <div className="text-neutral-500 text-[11px]">IFSC: <span className="font-mono font-semibold text-neutral-800">{settings.ifsc_code || 'HDFC0001234'}</span></div>
            </div>
            <div>
              <div className="text-neutral-500 text-[11px]">Official UPI ID:</div>
              <div className="font-mono font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-1 rounded inline-block mt-1">
                {settings.upi_id || 'skyphotostudio@okhdfcbank'}
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions & Signatures */}
        <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8 text-[11px]">
          <div>
            <span className="font-bold text-neutral-700 uppercase tracking-wider block mb-1.5">
              Terms & Conditions:
            </span>
            <p className="text-neutral-600 whitespace-pre-line leading-relaxed">
              {quotation.terms || settings.quotation_terms || '1. 50% advance to confirm the dates.\n2. Outstation travel to be provided by client.'}
            </p>
          </div>
          <div className="flex flex-col justify-end text-right">
            <div className="mb-10 text-neutral-400">For {currentOrg?.name}</div>
            <div className="border-t border-neutral-300 pt-1 font-semibold text-neutral-800">
              Authorized Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

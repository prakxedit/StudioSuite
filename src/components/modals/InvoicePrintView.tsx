import React from 'react';
import { X, Printer, Share2, Camera } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Invoice } from '../../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../../lib/formatters';

interface InvoicePrintViewProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({
  invoice,
  onClose,
}) => {
  const { currentOrg, settings, state } = useSkySuite();

  if (!invoice) return null;

  const customer = state.customers.find((c) => c.id === invoice.customer_id);

  const handlePrint = () => {
    window.print();
  };

  const shareText = `Tax Invoice ${invoice.invoice_number} from ${currentOrg?.name} for "${invoice.booking_title}". Total: ${formatINR(invoice.total)}, due by ${formatDate(invoice.due_date)}. Please find details enclosed. Thank you!`;
  const whatsappUrl = createWhatsAppUrl(customer?.phone || '', shareText);

  // If tax > 0, calculate CGST & SGST half & half
  const halfTax = invoice.tax > 0 ? Math.round(invoice.tax / 2) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Floating control bar */}
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

      {/* Invoice Page Container */}
      <div className="w-full max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 sm:p-12 shadow-2xl my-8 text-neutral-900 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Header */}
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
            <div className="text-[11px] text-neutral-500 leading-relaxed pt-1">
              <div>{currentOrg?.address || 'Signature Pinnacle, Indiranagar'}</div>
              <div>{currentOrg?.city || 'Bengaluru'}, {currentOrg?.state || 'Karnataka'} - {currentOrg?.pincode || '560038'}</div>
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
              {currentOrg?.gst_number ? 'TAX INVOICE' : 'COMMERCIAL BILL'}
            </span>
            <div className="text-lg font-bold text-neutral-950 font-mono">
              {invoice.invoice_number}
            </div>
            <div className="text-xs text-neutral-500">
              Invoice Date: <span className="font-mono text-neutral-800 font-medium">{formatDate(invoice.invoice_date)}</span>
            </div>
            <div className="text-xs text-neutral-500">
              Payment Due: <span className="font-mono text-neutral-800 font-medium">{formatDate(invoice.due_date)}</span>
            </div>
            <div className="mt-1">
              <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                Status: {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To Details */}
        <div className="grid grid-cols-2 gap-4 py-6 border-b border-neutral-100 text-xs">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Billed To (Client):
            </span>
            <div className="text-sm font-bold text-neutral-900">{invoice.customer_name}</div>
            <div className="text-neutral-600 font-mono mt-0.5">{customer?.phone || ''}</div>
            {customer?.address && (
              <div className="text-[11px] text-neutral-500 mt-0.5">{customer.address}</div>
            )}
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Project Description:
            </span>
            <div className="text-sm font-bold text-neutral-900">{invoice.booking_title}</div>
            {invoice.notes && (
              <div className="text-[11px] text-neutral-500 mt-1 leading-snug">{invoice.notes}</div>
            )}
          </div>
        </div>

        {/* Invoice Particulars Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="py-2.5">#</th>
                <th className="py-2.5">Description of Supply / Production Services</th>
                <th className="py-2.5 text-right">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              <tr>
                <td className="py-4 text-neutral-400 font-mono">1</td>
                <td className="py-4 pr-4">
                  <div className="font-bold text-neutral-900">{invoice.booking_title}</div>
                  <div className="text-[11px] text-neutral-500 font-normal mt-0.5 leading-relaxed">
                    Professional high-definition photography, cinematic videography coverage, and master album curation as contracted.
                  </div>
                </td>
                <td className="py-4 text-right font-mono font-bold text-neutral-900">
                  {formatINR(invoice.subtotal - invoice.discount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ledger Breakdown */}
        <div className="flex justify-end border-t border-neutral-200 pt-4">
          <div className="w-72 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-neutral-600">
              <span>Gross Subtotal:</span>
              <span>{formatINR(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Discount Allowed:</span>
                <span className="text-emerald-700 font-semibold">-{formatINR(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <>
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>CGST (9%):</span>
                  <span>{formatINR(halfTax)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 text-[11px]">
                  <span>SGST (9%):</span>
                  <span>{formatINR(halfTax)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-neutral-300 pt-2 text-base font-bold text-neutral-950">
              <span>Total Invoice Amount:</span>
              <span>{formatINR(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Banking and UPI Details */}
        <div className="mt-8 rounded-lg border border-neutral-200 p-4 bg-neutral-50/60 text-xs">
          <div className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
            Remittance Details
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-neutral-500 text-[11px]">Bank: <span className="font-semibold text-neutral-800">{settings.bank_name || 'HDFC Bank Ltd'}</span></div>
              <div className="text-neutral-500 text-[11px]">A/C No: <span className="font-mono font-semibold text-neutral-800">{settings.account_number || '50200034891234'}</span></div>
              <div className="text-neutral-500 text-[11px]">IFSC: <span className="font-mono font-semibold text-neutral-800">{settings.ifsc_code || 'HDFC0001234'}</span></div>
            </div>
            <div>
              <div className="text-neutral-500 text-[11px]">Instant UPI Transfer:</div>
              <div className="font-mono font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-1 rounded inline-block mt-1">
                {settings.upi_id || 'skyphotostudio@okhdfcbank'}
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8 text-[11px]">
          <div>
            <span className="font-bold text-neutral-700 block mb-1">Declaration:</span>
            <p className="text-neutral-500 leading-relaxed">
              We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.
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

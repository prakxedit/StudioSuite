import React from 'react';
import { X, Printer, Share2, Camera, PackageCheck, CheckCircle2 } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Deliverable } from '../../types';
import { formatDate, createWhatsAppUrl } from '../../lib/formatters';

interface DeliverableReceiptViewProps {
  deliverable: Deliverable | null;
  onClose: () => void;
}

export const DeliverableReceiptView: React.FC<DeliverableReceiptViewProps> = ({
  deliverable,
  onClose,
}) => {
  const { currentOrg } = useSkySuite();

  if (!deliverable) return null;

  const handlePrint = () => {
    window.print();
  };

  const shareText = `Delivery Receipt from ${currentOrg?.name}: Handed over "${deliverable.name}" (Qty: ${deliverable.quantity}) for "${deliverable.booking_title}" to ${deliverable.delivered_to || deliverable.customer_name}. Thank you!`;
  const whatsappUrl = createWhatsAppUrl(deliverable.customer_phone || '', shareText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto">
      {/* Control bar */}
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

      {/* Page Container */}
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
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest block">
              DELIVERY ACKNOWLEDGMENT
            </span>
            <div className="text-base font-bold text-neutral-950 font-mono">
              DEL-2026-{deliverable.id.slice(-4)}
            </div>
            <div className="text-xs text-neutral-500">
              Delivery Date:{' '}
              <span className="font-mono text-neutral-800 font-medium">
                {formatDate(deliverable.delivered_at || deliverable.due_date)}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3 w-3" />
              <span>Goods Delivered</span>
            </div>
          </div>
        </div>

        {/* Client particulars */}
        <div className="grid grid-cols-2 gap-4 py-5 border-b border-neutral-100 text-xs">
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Delivered To:
            </span>
            <div className="text-sm font-bold text-neutral-900">
              {deliverable.delivered_to || deliverable.customer_name}
            </div>
            <div className="text-neutral-600 font-mono mt-0.5">{deliverable.customer_phone || ''}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              Associated Booking:
            </span>
            <div className="text-sm font-bold text-neutral-900">{deliverable.booking_title}</div>
            <div className="text-neutral-500 text-[11px] mt-0.5">Category: {deliverable.category}</div>
          </div>
        </div>

        {/* Deliverable Items Box */}
        <div className="my-6 border border-neutral-200 rounded-xl overflow-hidden text-xs">
          <div className="bg-neutral-50 px-4 py-2.5 font-bold text-neutral-700 flex justify-between">
            <span>Particulars of Delivered Item</span>
            <span>Quantity</span>
          </div>
          <div className="p-4 flex items-start justify-between">
            <div>
              <div className="font-bold text-sm text-neutral-950">{deliverable.name}</div>
              <div className="text-neutral-500 text-xs mt-1">
                Fulfilled by studio production team ({deliverable.assigned_to || 'Studio'}). Soft proofing approved by client.
              </div>
              {deliverable.delivery_notes && (
                <div className="mt-2 text-[11px] text-neutral-700 bg-neutral-50 p-2 rounded">
                  Note: {deliverable.delivery_notes}
                </div>
              )}
            </div>
            <div className="text-base font-bold font-mono text-neutral-900">
              {deliverable.quantity} unit(s)
            </div>
          </div>
        </div>

        {/* Acceptance Signatures */}
        <div className="mt-10 pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8 text-[11px]">
          <div>
            <div className="mb-10 text-neutral-400">Delivered on behalf of {currentOrg?.name}</div>
            <div className="border-t border-neutral-300 pt-1 font-semibold text-neutral-800">
              Studio Representative Signature
            </div>
          </div>
          <div className="flex flex-col justify-end text-right">
            <div className="mb-10 text-neutral-400">
              Received in satisfactory good condition by:
            </div>
            <div className="border-t border-neutral-300 pt-1 font-semibold text-neutral-800">
              Client / Recipient Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

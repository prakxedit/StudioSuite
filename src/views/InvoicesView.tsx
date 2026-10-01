import React, { useState } from 'react';
import { FileText, Plus, Eye, Share2, Search, Edit2 } from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Invoice } from '../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../lib/formatters';

interface InvoicesViewProps {
  onNewInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onPreviewInvoice: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  onNewInvoice,
  onEditInvoice,
  onPreviewInvoice,
}) => {
  const { db, state } = useSkySuite();
  const [search, setSearch] = useState('');

  const invoices = db.getInvoices();

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.booking_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number, client, project..."
            className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <button
          onClick={onNewInvoice}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* Invoice List */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-neutral-900">No invoices generated yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              Issue GST or non-GST commercial tax bills for your studio projects.
            </p>
            <button
              onClick={onNewInvoice}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Invoice</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer & Project</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">Tax (GST)</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onPreviewInvoice(inv)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-neutral-950">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-950">{inv.customer_name}</div>
                      <div className="text-[11px] text-neutral-500">{inv.booking_title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {formatDate(inv.invoice_date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-700">
                      {formatINR(inv.subtotal - inv.discount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-neutral-500">
                      {formatINR(inv.tax)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-950">
                      {formatINR(inv.total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onPreviewInvoice(inv)}
                          className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Print / View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Edit invoice"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

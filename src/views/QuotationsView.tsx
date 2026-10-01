import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Eye,
  CalendarCheck,
  Share2,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Quotation, QuotationStatus } from '../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../lib/formatters';

interface QuotationsViewProps {
  onNewQuotation: () => void;
  onEditQuotation: (quotation: Quotation) => void;
  onPreviewQuotation: (quotation: Quotation) => void;
  onConvertToBooking: (quotationId: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  onNewQuotation,
  onEditQuotation,
  onPreviewQuotation,
  onConvertToBooking,
}) => {
  const { db, state } = useSkySuite();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const quotations = db.getQuotations();

  const filtered = quotations.filter((q) => {
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    const matchesSearch =
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      q.event_title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = ['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

  return (
    <div className="space-y-4">
      {/* Top Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotation #, client, event..."
              className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50 overflow-x-auto">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-neutral-950 font-semibold shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onNewQuotation}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Quotations List Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-neutral-900">No quotations found</p>
            <p className="text-xs text-neutral-500 mt-1">
              Create professional, itemized photography proposals with automated pricing.
            </p>
            <button
              onClick={onNewQuotation}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Quotation</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Client & Project</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4 text-right">Items</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filtered.map((q) => {
                  const waMessage = `Hello ${q.customer_name}, here is your quotation for "${q.event_title}" (${q.quotation_number}) for a total of ${formatINR(q.total)}. Valid until ${formatDate(q.valid_until)}.`;
                  const waUrl = createWhatsAppUrl(q.customer_phone, waMessage);

                  return (
                    <tr
                      key={q.id}
                      onClick={() => onPreviewQuotation(q)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-950">
                        {q.quotation_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-950">{q.event_title}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {q.customer_name} ({q.customer_phone})
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {formatDate(q.quotation_date)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600">
                        {formatDate(q.valid_until)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-neutral-600">
                        {q.items.length} service(s)
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-950">
                        {formatINR(q.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            q.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : q.status === 'SENT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPreviewQuotation(q)}
                            className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Preview / Print PDF"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="h-4 w-4" />
                          </a>
                          {q.status !== 'ACCEPTED' && (
                            <button
                              onClick={() => onConvertToBooking(q.id)}
                              className="rounded p-1.5 text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Accept & Convert to Booking"
                            >
                              <CalendarCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditQuotation(q)}
                            className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit quotation"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Inbox,
  Plus,
  Calendar,
  IndianRupee,
  MapPin,
  Clock,
  Share2,
  ChevronRight,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Enquiry, EnquiryStatus } from '../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../lib/formatters';

interface EnquiriesViewProps {
  onNewEnquiry: () => void;
  onEditEnquiry: (enquiry: Enquiry) => void;
  onConvertToQuotation: (enquiry: Enquiry) => void;
  onConvertToBooking: (enquiry: Enquiry) => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  onNewEnquiry,
  onEditEnquiry,
  onConvertToQuotation,
  onConvertToBooking,
}) => {
  const { db, state } = useSkySuite();
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
  const [search, setSearch] = useState('');

  const enquiries = db.getEnquiries();

  const pipelineStages: { id: EnquiryStatus; label: string; count: number }[] = [
    { id: 'NEW', label: 'New Leads', count: enquiries.filter((e) => e.status === 'NEW').length },
    { id: 'CONTACTED', label: 'Contacted', count: enquiries.filter((e) => e.status === 'CONTACTED').length },
    { id: 'QUOTATION_SENT', label: 'Quotation Sent', count: enquiries.filter((e) => e.status === 'QUOTATION_SENT').length },
    { id: 'FOLLOW_UP', label: 'Follow Up', count: enquiries.filter((e) => e.status === 'FOLLOW_UP').length },
    { id: 'NEGOTIATION', label: 'Negotiation', count: enquiries.filter((e) => e.status === 'NEGOTIATION').length },
    { id: 'BOOKED', label: 'Booked', count: enquiries.filter((e) => e.status === 'BOOKED').length },
    { id: 'LOST', label: 'Lost', count: enquiries.filter((e) => e.status === 'LOST').length },
  ];

  const filteredEnquiries = enquiries.filter(
    (e) =>
      e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      e.customer_phone.includes(search) ||
      e.event_type.toLowerCase().includes(search.toLowerCase())
  );

  const moveStatus = (enquiryId: string, nextStatus: EnquiryStatus) => {
    db.updateEnquiry(enquiryId, { status: nextStatus });
  };

  return (
    <div className="space-y-4">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, event, phone..."
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none w-64"
          />

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-white text-neutral-950 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Pipeline</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-neutral-950 shadow-2xs font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        <button
          onClick={onNewEnquiry}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* PIPELINE KANBAN VIEW */}
      {viewMode === 'pipeline' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {pipelineStages.map((stage) => {
            const stageLeads = filteredEnquiries.filter((e) => e.status === stage.id);

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-neutral-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900">{stage.label}</span>
                    <span className="font-mono text-[10px] text-neutral-500 bg-white border border-neutral-200 px-1.5 py-0.5 rounded-full font-bold">
                      {stage.count}
                    </span>
                  </div>
                </div>

                {/* Cards in Column */}
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-neutral-400">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((enq) => (
                      <div
                        key={enq.id}
                        className="rounded-lg border border-neutral-200 bg-white p-3 shadow-2xs hover:border-neutral-400 transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-neutral-950">{enq.customer_name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                              {enq.customer_phone}
                            </div>
                          </div>
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                            {enq.event_type}
                          </span>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-1 text-[11px] text-neutral-600">
                          {enq.event_date && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-neutral-400" />
                              <span>{formatDate(enq.event_date)}</span>
                            </div>
                          )}
                          {enq.venue && (
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="h-3 w-3 text-neutral-400" />
                              <span className="truncate">{enq.venue}</span>
                            </div>
                          )}
                          {enq.estimated_budget ? (
                            <div className="flex items-center gap-1 font-mono font-semibold text-neutral-900">
                              <span>Budget: {formatINR(enq.estimated_budget)}</span>
                            </div>
                          ) : null}
                          <div className="text-[10px] text-neutral-400">
                            Source: {enq.lead_source}
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <button
                            onClick={() => onEditEnquiry(enq)}
                            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-950 cursor-pointer"
                          >
                            Edit / Move
                          </button>

                          <div className="flex items-center gap-1">
                            {stage.id !== 'BOOKED' && stage.id !== 'LOST' && (
                              <button
                                onClick={() => onConvertToQuotation(enq)}
                                title="Draft Quotation"
                                className="rounded p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {stage.id !== 'BOOKED' && (
                              <button
                                onClick={() => onConvertToBooking(enq)}
                                title="Convert to Booking"
                                className="rounded p-1 text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              >
                                <CalendarCheck className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4 text-right">Budget</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredEnquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => onEditEnquiry(enq)}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-950">{enq.customer_name}</div>
                      <div className="font-mono text-neutral-500 text-[11px]">{enq.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-700">{enq.event_type}</td>
                    <td className="py-3 px-4 font-mono text-neutral-700">{formatDate(enq.event_date)}</td>
                    <td className="py-3 px-4 text-neutral-600 max-w-[150px] truncate">{enq.venue || '—'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatINR(enq.estimated_budget)}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{enq.lead_source}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                        {enq.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEditEnquiry(enq)}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

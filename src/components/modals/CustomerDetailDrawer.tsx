import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  CalendarCheck,
  IndianRupee,
  Edit2,
  Calendar,
  FileSpreadsheet,
  PackageCheck,
  Clock,
  MapPin,
  Mail,
  Plus,
} from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Customer } from '../../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../../lib/formatters';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onNewBooking: (customer: Customer) => void;
  onReceivePayment: (customer: Customer) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  onClose,
  onEdit,
  onNewBooking,
  onReceivePayment,
}) => {
  const { db, state } = useSkySuite();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'quotations' | 'payments' | 'deliverables'>('overview');

  if (!customer) return null;

  const financials = db.getCustomerFinancials(customer.id);
  const bookings = state.bookings.filter((b) => b.customer_id === customer.id);
  const quotations = state.quotations.filter((q) => q.customer_id === customer.id);
  const payments = state.payments.filter((p) => p.customer_id === customer.id);
  const deliverables = state.deliverables.filter((d) => {
    return bookings.some((b) => b.id === d.booking_id);
  });
  const eventDays = state.eventDays.filter((e) => {
    return bookings.some((b) => b.id === e.booking_id);
  });

  const whatsappUrl = createWhatsAppUrl(
    customer.phone,
    `Hello ${customer.name}, greetings from Sky Photography Studio! Let us know how we can assist you with your photography coverage.`
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 p-5 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-950">{customer.name}</h2>
              <span className="font-mono text-[10px] text-neutral-500 uppercase bg-neutral-200/60 px-1.5 py-0.5 rounded">
                Client
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
              <span className="flex items-center gap-1 font-mono text-neutral-700">
                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                {customer.phone}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  {customer.email}
                </span>
              )}
              {customer.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  {customer.city}, {customer.state}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-5 py-3 bg-white">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-emerald-50 text-emerald-800 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-neutral-500" />
            <span>Call</span>
          </a>
          <button
            onClick={() => onEdit(customer)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-neutral-500" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => onNewBooking(customer)}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>New Booking</span>
          </button>
          <button
            onClick={() => onReceivePayment(customer)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-900 text-neutral-900 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <IndianRupee className="h-3.5 w-3.5" />
            <span>Receive Payment</span>
          </button>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-4 gap-2 border-b border-neutral-100 p-5 bg-neutral-50/30">
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <span className="text-[11px] text-neutral-500 block">Total Bookings</span>
            <span className="text-base font-bold text-neutral-900 font-mono">
              {financials.bookingCount}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <span className="text-[11px] text-neutral-500 block">Contract Value</span>
            <span className="text-base font-bold text-neutral-900 font-mono">
              {formatINR(financials.totalValue)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <span className="text-[11px] text-neutral-500 block">Received</span>
            <span className="text-base font-bold text-emerald-800 font-mono">
              {formatINR(financials.totalReceived)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg border border-neutral-200 bg-white">
            <span className="text-[11px] text-neutral-500 block">Outstanding</span>
            <span
              className={`text-base font-bold font-mono ${
                financials.outstanding > 0 ? 'text-amber-800' : 'text-neutral-900'
              }`}
            >
              {formatINR(financials.outstanding)}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-neutral-200 px-5 gap-4">
          {[
            { id: 'overview', label: 'Overview & Events' },
            { id: 'bookings', label: `Bookings (${bookings.length})` },
            { id: 'quotations', label: `Quotations (${quotations.length})` },
            { id: 'payments', label: `Payments (${payments.length})` },
            { id: 'deliverables', label: `Deliverables (${deliverables.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Event Days list */}
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                  Scheduled Shoot Days ({eventDays.length})
                </h3>
                {eventDays.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-3">No event shoot days scheduled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {eventDays.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-lg border border-neutral-200 p-3 bg-white text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900">{ev.event_name}</span>
                          <span className="font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                            {formatDate(ev.event_date)}
                          </span>
                        </div>
                        <div className="text-neutral-500 text-[11px] flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {ev.start_time} - {ev.end_time}
                          </span>
                          <span>· Venue: {ev.venue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes & Address */}
              {customer.notes && (
                <div className="rounded-lg border border-neutral-200 p-3.5 bg-neutral-50/60">
                  <span className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Client Notes:
                  </span>
                  <p className="text-xs text-neutral-600 whitespace-pre-line leading-relaxed">
                    {customer.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-2">
              {bookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">No bookings yet.</div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-neutral-200 p-3.5 bg-white space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-neutral-500">
                        {b.booking_number}
                      </span>
                      <span className="font-mono font-bold text-xs text-neutral-900">
                        {formatINR(b.total_amount)}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-neutral-900">{b.title}</div>
                    <div className="text-[11px] text-neutral-500">
                      Created on {formatDate(b.created_at)} · Status: {b.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="space-y-2">
              {quotations.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">No quotations generated yet.</div>
              ) : (
                quotations.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-neutral-200 p-3.5 bg-white space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-neutral-500">
                        {q.quotation_number}
                      </span>
                      <span className="font-mono font-bold text-xs text-neutral-900">
                        {formatINR(q.total)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-900">{q.event_title}</div>
                    <div className="text-[11px] text-neutral-500">
                      Valid until {formatDate(q.valid_until)} · Status: {q.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-2">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">No payments recorded.</div>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-neutral-200 p-3 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono text-neutral-500 text-[11px]">{p.receipt_number}</div>
                      <div className="text-neutral-900 font-semibold mt-0.5">
                        {formatDate(p.payment_date)} via {p.payment_method}
                      </div>
                      {p.reference_number && (
                        <div className="text-neutral-400 text-[10px] font-mono">
                          Ref: {p.reference_number}
                        </div>
                      )}
                    </div>
                    <div className="font-mono font-bold text-emerald-800 text-sm">
                      {formatINR(p.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="space-y-2">
              {deliverables.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">No deliverables tracked.</div>
              ) : (
                deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl border border-neutral-200 p-3 bg-white text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">{d.name}</span>
                      <span className="font-mono text-[10px] text-neutral-500 uppercase bg-neutral-100 px-2 py-0.5 rounded">
                        {d.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Qty: {d.quantity} · Due: {formatDate(d.due_date)} {d.assigned_to ? `· Handled by: ${d.assigned_to}` : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

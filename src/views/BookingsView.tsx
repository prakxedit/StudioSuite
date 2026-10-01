import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Users,
  Edit2,
  Trash2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Booking, BookingEventDay } from '../types';
import { formatINR, formatDate, formatTime } from '../lib/formatters';

interface BookingsViewProps {
  onNewBooking: () => void;
  onEditBooking: (booking: Booking) => void;
  onAddEventDay: (bookingId: string) => void;
  onRecordPaymentForBooking: (bookingId: string) => void;
  onAssignCrew: (eventDayId: string) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  onNewBooking,
  onEditBooking,
  onAddEventDay,
  onRecordPaymentForBooking,
  onAssignCrew,
}) => {
  const { db, state } = useSkySuite();
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(
    state.bookings[0]?.id || null
  );

  const bookings = db.getBookings();

  const toggleExpand = (id: string) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Commercial Bookings & Production</h2>
          <p className="text-[11px] text-neutral-500">
            Master contracts with multiple shoot days, payment milestones, and profitability
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Bookings Accordion List */}
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-16 text-center shadow-2xs">
            <p className="text-sm font-semibold text-neutral-900">No bookings registered yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              Convert accepted quotations or directly register new wedding & shoot agreements.
            </p>
            <button
              onClick={onNewBooking}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Booking</span>
            </button>
          </div>
        ) : (
          bookings.map((booking) => {
            const isExpanded = expandedBookingId === booking.id;
            const financials = db.getBookingFinancials(booking.id);
            const eventDays = db.getBookingEventDays(booking.id);
            const schedules = db.getPaymentSchedules(booking.id);
            const payments = state.payments.filter((p) => p.booking_id === booking.id);
            const deliverables = state.deliverables.filter((d) => d.booking_id === booking.id);

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden transition-all"
              >
                {/* Summary Header Row */}
                <div
                  onClick={() => toggleExpand(booking.id)}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-neutral-50/70 transition-colors cursor-pointer gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-neutral-500">
                        {booking.booking_number}
                      </span>
                      <h3 className="font-bold text-sm text-neutral-950">{booking.title}</h3>
                      <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-3">
                      <span>Client: <strong className="text-neutral-800">{booking.customer_name}</strong></span>
                      <span>·</span>
                      <span className="font-mono">{booking.customer_phone}</span>
                      <span>·</span>
                      <span>{eventDays.length} shoot day(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-5">
                    {/* Financial Metrics Strip */}
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-sans">Agreed Value</span>
                        <span className="font-bold text-neutral-900">{formatINR(financials.total)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-sans">Received</span>
                        <span className="font-bold text-emerald-800">{formatINR(financials.received)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-sans">Outstanding</span>
                        <span className={`font-bold ${financials.outstanding > 0 ? 'text-amber-800' : 'text-neutral-900'}`}>
                          {formatINR(financials.outstanding)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBooking(booking);
                        }}
                        className="rounded p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                        title="Edit booking"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Multi-Tab Inspection Panel */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 bg-neutral-50/40 p-5 space-y-5 animate-in slide-in-from-top-1 duration-150">
                    {/* 1. Distinct Event Days & Crew Roster */}
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                            Event Shoot Functions ({eventDays.length})
                          </h4>
                          <p className="text-[11px] text-neutral-500">
                            Ceremonies, venues, timings, and assigned crew members
                          </p>
                        </div>
                        <button
                          onClick={() => onAddEventDay(booking.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Function</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {eventDays.map((ed) => {
                          const assignments = state.teamAssignments.filter(
                            (a) => a.event_day_id === ed.id
                          );

                          return (
                            <div
                              key={ed.id}
                              className="rounded-xl border border-neutral-200 bg-white p-3.5 space-y-2 shadow-2xs"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="font-bold text-xs text-neutral-900">
                                    {ed.event_name}
                                  </span>
                                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                    {formatDate(ed.event_date)} · {formatTime(ed.start_time)} -{' '}
                                    {formatTime(ed.end_time)}
                                  </div>
                                </div>
                                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                                  {ed.event_type}
                                </span>
                              </div>

                              <div className="text-[11px] text-neutral-600 flex items-center gap-1.5 truncate">
                                <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{ed.venue}</span>
                              </div>

                              {/* Crew Assigned to this Event Day */}
                              <div className="pt-2 border-t border-neutral-100">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-semibold text-neutral-500">
                                    Crew Assigned ({assignments.length})
                                  </span>
                                  <button
                                    onClick={() => onAssignCrew(ed.id)}
                                    className="text-[11px] font-semibold text-neutral-900 hover:underline cursor-pointer"
                                  >
                                    + Assign Crew
                                  </button>
                                </div>
                                {assignments.length > 0 ? (
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {assignments.map((asn) => (
                                      <span
                                        key={asn.id}
                                        className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800"
                                      >
                                        <Users className="h-3 w-3 text-neutral-500" />
                                        {asn.team_member_name} ({asn.role})
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-neutral-400 italic mt-0.5">
                                    No crew assigned yet.
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Commercial Milestones & Payments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Payment Schedules */}
                      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                          <span className="text-xs font-bold text-neutral-900">
                            Payment Schedule Milestones
                          </span>
                          <button
                            onClick={() => onRecordPaymentForBooking(booking.id)}
                            className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
                          >
                            + Receive Payment
                          </button>
                        </div>
                        <div className="space-y-2 text-xs">
                          {schedules.map((sch) => (
                            <div
                              key={sch.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-neutral-100"
                            >
                              <div>
                                <div className="font-semibold text-neutral-900">{sch.title}</div>
                                <div className="text-[11px] text-neutral-500">
                                  Due: <span className="font-mono">{formatDate(sch.due_date)}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-neutral-900">
                                  {formatINR(sch.amount)}
                                </div>
                                <span
                                  className={`font-mono text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                    sch.status === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-neutral-200 text-neutral-700'
                                  }`}
                                >
                                  {sch.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Profitability Ledger */}
                      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2">
                        <span className="text-xs font-bold text-neutral-900 block pb-2 border-b border-neutral-100">
                          Booking Profitability Analysis
                        </span>
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between text-neutral-600">
                            <span>Contract Total:</span>
                            <span className="font-semibold text-neutral-900">
                              {formatINR(financials.total)}
                            </span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>Payments Collected:</span>
                            <span className="font-semibold text-emerald-800">
                              {formatINR(financials.received)}
                            </span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>Direct Shoot Expenses:</span>
                            <span className="font-semibold text-rose-800">
                              -{formatINR(financials.expenses)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-neutral-200 pt-1.5 font-bold text-neutral-950">
                            <span>Estimated Booking Profit:</span>
                            <span>{formatINR(financials.profit)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

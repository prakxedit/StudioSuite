import React from 'react';
import {
  Calendar,
  IndianRupee,
  CalendarCheck,
  PackageCheck,
  Inbox,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { ActiveTab } from '../components/Sidebar';
import { QuickActionType } from '../components/QuickActionModal';
import { formatINR, formatDate, formatTime } from '../lib/formatters';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab, id?: string) => void;
  onQuickAction: (action: QuickActionType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onQuickAction,
}) => {
  const { summary, state, db } = useSkySuite();

  // Upcoming Event Days (sorted by event_date ascending, event_date >= today)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = state.eventDays
    .filter((ev) => ev.organization_id === state.currentOrgId && ev.status !== 'CANCELLED')
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 5);

  // Recent Payments
  const recentPayments = state.payments
    .filter((p) => p.organization_id === state.currentOrgId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Pending Deliveries
  const pendingDeliveries = state.deliverables
    .filter(
      (d) =>
        d.organization_id === state.currentOrgId &&
        d.status !== 'DELIVERED' &&
        d.status !== 'CANCELLED'
    )
    .slice(0, 4);

  // Follow-ups due
  const pendingFollowups = state.enquiries
    .filter(
      (enq) =>
        enq.organization_id === state.currentOrgId &&
        enq.status !== 'BOOKED' &&
        enq.status !== 'LOST' &&
        enq.next_followup_date
    )
    .slice(0, 4);

  // Overdue payment schedules
  const overdueSchedules = state.paymentSchedules
    .filter(
      (s) =>
        s.organization_id === state.currentOrgId &&
        s.status !== 'PAID' &&
        s.due_date < todayStr
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Financial Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Booked Revenue */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Agreed Revenue</span>
            <span className="rounded-md bg-neutral-100 p-1.5 text-neutral-700">
              <CalendarCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-neutral-950">
            {formatINR(summary.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>{summary.totalBookings} total bookings</span>
            <span className="font-semibold text-neutral-800">{summary.activeBookings} active</span>
          </div>
        </div>

        {/* Received Payments */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Received</span>
            <span className="rounded-md bg-emerald-50 p-1.5 text-emerald-700">
              <IndianRupee className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-emerald-800">
            {formatINR(summary.totalReceived)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Verified in studio bank/cash</span>
            <span className="font-mono text-emerald-800 font-medium">
              {summary.totalRevenue > 0
                ? `${Math.round((summary.totalReceived / summary.totalRevenue) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Outstanding Balance</span>
            <span className="rounded-md bg-amber-50 p-1.5 text-amber-700">
              <AlertCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-amber-800">
            {formatINR(summary.totalOutstanding)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Client receivables due</span>
            <button
              onClick={() => onNavigate('payments')}
              className="text-amber-800 font-semibold hover:underline cursor-pointer"
            >
              View ledger
            </button>
          </div>
        </div>

        {/* Net Studio Profit */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs hover:border-neutral-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Estimated Profit</span>
            <span className="rounded-md bg-neutral-100 p-1.5 text-neutral-700">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-neutral-950">
            {formatINR(summary.estimatedProfit)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Expenses: {formatINR(summary.totalExpenses)}</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-neutral-800 font-semibold hover:underline cursor-pointer"
            >
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Operational Highlights Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('calendar')}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-left hover:border-neutral-400 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-[11px] text-neutral-500 block">Upcoming Events</span>
            <span className="text-lg font-bold font-mono text-neutral-900">
              {summary.upcomingEventsCount}
            </span>
          </div>
          <Calendar className="h-4 w-4 text-neutral-400" />
        </button>

        <button
          onClick={() => onNavigate('deliverables')}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-left hover:border-neutral-400 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-[11px] text-neutral-500 block">Pending Deliveries</span>
            <span className="text-lg font-bold font-mono text-neutral-900">
              {summary.pendingDeliveries}
            </span>
          </div>
          <PackageCheck className="h-4 w-4 text-neutral-400" />
        </button>

        <button
          onClick={() => onNavigate('enquiries')}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-left hover:border-neutral-400 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-[11px] text-neutral-500 block">Open Leads / Enquiries</span>
            <span className="text-lg font-bold font-mono text-neutral-900">
              {summary.openEnquiriesCount}
            </span>
          </div>
          <Inbox className="h-4 w-4 text-neutral-400" />
        </button>

        <button
          onClick={() => onNavigate('customers')}
          className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 text-left hover:border-neutral-400 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-[11px] text-neutral-500 block">Customer Base</span>
            <span className="text-lg font-bold font-mono text-neutral-900">
              {state.customers.length}
            </span>
          </div>
          <Users className="h-4 w-4 text-neutral-400" />
        </button>
      </div>

      {/* Main Grid: Upcoming Events & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Event Production Days */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Upcoming Shoot Functions</h2>
              <p className="text-[11px] text-neutral-500">
                Scheduled ceremony days, call timings & locations
              </p>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-950 cursor-pointer"
            >
              <span>Full Calendar</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No upcoming event days scheduled.
              </div>
            ) : (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onNavigate('bookings', ev.booking_id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 hover:bg-neutral-50/80 -mx-2 px-2 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 group-hover:text-neutral-950">
                        {ev.event_name}
                      </span>
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                        {ev.event_type}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                      <span>{ev.booking_title}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.venue}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0 sm:text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-neutral-900">
                      {formatDate(ev.event_date)}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      {formatTime(ev.start_time)} - {formatTime(ev.end_time)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Payments Ledger */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Recent Payments</h2>
              <p className="text-[11px] text-neutral-500">Real-time collections</p>
            </div>
            <button
              onClick={() => onQuickAction('receive_payment')}
              className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
            >
              + Record
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">No payments yet.</div>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('payments')}
                  className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-neutral-900">{p.customer_name}</div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">{p.receipt_number}</span>
                      <span>·</span>
                      <span>{p.payment_method}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-800 text-xs">
                      {formatINR(p.amount)}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {formatDate(p.payment_date)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Pending Deliveries & Overdue / Follow-ups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Deliverables */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Production Deliverables</h2>
              <p className="text-[11px] text-neutral-500">Albums & video edits in pipeline</p>
            </div>
            <button
              onClick={() => onNavigate('deliverables')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 cursor-pointer"
            >
              View All ({summary.pendingDeliveries})
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {pendingDeliveries.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">All deliverables fulfilled!</div>
            ) : (
              pendingDeliveries.map((d) => (
                <div
                  key={d.id}
                  onClick={() => onNavigate('deliverables')}
                  className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-neutral-900">{d.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {d.booking_title} · Due: <span className="font-mono">{formatDate(d.due_date)}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                    {d.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lead Follow-ups & Reminders */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Lead Follow-ups Due</h2>
              <p className="text-[11px] text-neutral-500">Enquiry leads awaiting action</p>
            </div>
            <button
              onClick={() => onNavigate('enquiries')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 cursor-pointer"
            >
              CRM Pipeline
            </button>
          </div>

          <div className="divide-y divide-neutral-100 pt-1">
            {pendingFollowups.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">No follow-ups due today.</div>
            ) : (
              pendingFollowups.map((enq) => (
                <div
                  key={enq.id}
                  onClick={() => onNavigate('enquiries')}
                  className="py-3 flex items-center justify-between text-xs hover:bg-neutral-50 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-neutral-900">{enq.customer_name}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {enq.event_type} · Lead via {enq.lead_source}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Follow-up: {formatDate(enq.next_followup_date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

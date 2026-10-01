import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Plus,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { BookingEventDay } from '../types';
import { formatDate, formatTime } from '../lib/formatters';

interface CalendarViewProps {
  onSelectEvent: (eventDay: BookingEventDay) => void;
  onAssignCrew: (eventDayId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectEvent,
  onAssignCrew,
}) => {
  const { state } = useSkySuite();
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 11, 1)); // Default around demo date (Dec 2026)

  const eventDays = state.eventDays.filter(
    (ed) => ed.organization_id === state.currentOrgId && ed.status !== 'CANCELLED'
  );

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearLabel = currentDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days for the month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1">
            <button
              onClick={prevMonth}
              className="rounded p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-bold text-neutral-900 min-w-[120px] text-center">
              {monthYearLabel}
            </span>
            <button
              onClick={nextMonth}
              className="rounded p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50">
          {(['month', 'week', 'day'] as const).map((vm) => (
            <button
              key={vm}
              onClick={() => setCalendarView(vm)}
              className={`rounded px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                calendarView === vm
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {vm}
            </button>
          ))}
        </div>
      </div>

      {/* Month View Grid */}
      {calendarView === 'month' && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-[11px] font-bold text-neutral-500 py-2.5 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-100 text-xs min-h-[500px]">
            {daysArray.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} className="bg-neutral-50/40 p-2 min-h-[90px]" />;
              }

              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = eventDays.filter((e) => e.event_date === dateString);

              return (
                <div
                  key={dateString}
                  className="p-2 min-h-[100px] flex flex-col justify-between hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-neutral-700">{dayNum}</span>
                    {dayEvents.length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvents.map((ev) => {
                      const crew = state.teamAssignments.filter((a) => a.event_day_id === ev.id);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => onSelectEvent(ev)}
                          className="rounded-md border border-neutral-200 bg-neutral-100/90 p-1.5 text-[11px] hover:border-neutral-900 transition-colors cursor-pointer group"
                        >
                          <div className="font-bold text-neutral-900 truncate">
                            {ev.event_name}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono truncate">
                            {formatTime(ev.start_time)} · {ev.venue}
                          </div>
                          {crew.length > 0 && (
                            <div className="text-[9px] text-neutral-600 flex items-center gap-1 mt-0.5">
                              <Users className="h-2.5 w-2.5" />
                              <span>{crew.length} crew</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View List fallback */}
      {calendarView !== 'month' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            All Event Shoot Dates in Timeline
          </h3>
          <div className="divide-y divide-neutral-100">
            {eventDays.map((ev) => {
              const crew = state.teamAssignments.filter((a) => a.event_day_id === ev.id);
              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="py-3.5 flex items-center justify-between hover:bg-neutral-50 px-2 rounded-lg transition-colors cursor-pointer text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{ev.event_name}</span>
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-700">
                        {ev.event_type}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                      <span>{ev.booking_title}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ev.venue}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-neutral-900">{formatDate(ev.event_date)}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {formatTime(ev.start_time)} - {formatTime(ev.end_time)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

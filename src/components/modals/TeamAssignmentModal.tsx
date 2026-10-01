import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Clock, IndianRupee, Briefcase, Calendar } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { BookingEventDay, TeamMember } from '../../types';
import { formatDate, formatTime, formatINR } from '../../lib/formatters';

interface TeamAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEventDayId?: string;
}

export const TeamAssignmentModal: React.FC<TeamAssignmentModalProps> = ({
  isOpen,
  onClose,
  initialEventDayId,
}) => {
  const { db, state } = useSkySuite();

  const [eventDayId, setEventDayId] = useState('');
  const [teamMemberId, setTeamMemberId] = useState('');
  const [role, setRole] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('14:00');
  const [rate, setRate] = useState<number | string>(10000);
  const [notes, setNotes] = useState('');

  // Conflict warning dialog state
  const [conflictData, setConflictData] = useState<{
    hasConflict: boolean;
    conflictingEvent?: BookingEventDay;
    memberName?: string;
  } | null>(null);

  useEffect(() => {
    if (initialEventDayId) {
      setEventDayId(initialEventDayId);
      const ev = state.eventDays.find((e) => e.id === initialEventDayId);
      if (ev) {
        setStartTime(ev.start_time);
        setEndTime(ev.end_time);
      }
    } else if (state.eventDays.length > 0) {
      setEventDayId(state.eventDays[0].id);
      setStartTime(state.eventDays[0].start_time);
      setEndTime(state.eventDays[0].end_time);
    }

    if (state.teamMembers.length > 0) {
      setTeamMemberId(state.teamMembers[0].id);
      setRole(state.teamMembers[0].role);
      setRate(state.teamMembers[0].daily_rate);
    }
    setConflictData(null);
  }, [initialEventDayId, state.eventDays, state.teamMembers, isOpen]);

  // When team member selection changes, auto-populate role and rate
  const handleMemberChange = (mId: string) => {
    setTeamMemberId(mId);
    const m = state.teamMembers.find((member) => member.id === mId);
    if (m) {
      setRole(m.role);
      setRate(m.daily_rate);
    }
  };

  if (!isOpen) return null;

  const currentEvent = state.eventDays.find((e) => e.id === eventDayId);
  const currentMember = state.teamMembers.find((m) => m.id === teamMemberId);

  const performSave = () => {
    if (!eventDayId || !teamMemberId) return;

    db.assignTeamMember({
      event_day_id: eventDayId,
      team_member_id: teamMemberId,
      role: role || currentMember?.role || 'Crew',
      start_time: startTime,
      end_time: endTime,
      rate: Number(rate) || 0,
      notes,
    });

    onClose();
  };

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDayId || !teamMemberId || !currentEvent) return;

    // Check for real assignment conflict on this date & time range
    const conflict = db.checkTeamConflict(
      teamMemberId,
      currentEvent.event_date,
      startTime,
      endTime
    );

    if (conflict.hasConflict && conflict.conflictingEvent) {
      // Trigger conflict modal / warning
      setConflictData({
        hasConflict: true,
        conflictingEvent: conflict.conflictingEvent,
        memberName: currentMember?.name || 'Selected crew member',
      });
      return;
    }

    // No conflict, proceed
    performSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Assign Crew to Event Day</h2>
            <p className="text-[11px] text-neutral-500">
              Schedule shoot assignments with automatic schedule conflict detection
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* PROMINENT CONFLICT DIALOG (Section 21) */}
        {conflictData && conflictData.hasConflict && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">Crew Schedule Conflict Detected!</h4>
                <p className="mt-1 leading-relaxed text-amber-900/90">
                  ⚠️ <span className="font-semibold">{conflictData.memberName}</span> is already
                  assigned to another event during this time:
                </p>
                <div className="mt-2 rounded-lg bg-white/80 border border-amber-200 p-2.5 text-[11px]">
                  <div className="font-bold text-neutral-900">
                    {conflictData.conflictingEvent?.event_name} ({conflictData.conflictingEvent?.booking_title})
                  </div>
                  <div className="text-neutral-600 mt-0.5">
                    Date: {formatDate(conflictData.conflictingEvent?.event_date)} · Time:{' '}
                    {formatTime(conflictData.conflictingEvent?.start_time)} to{' '}
                    {formatTime(conflictData.conflictingEvent?.end_time)}
                  </div>
                  <div className="text-neutral-500 text-[10px]">
                    Venue: {conflictData.conflictingEvent?.venue}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => setConflictData(null)}
                className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performSave}
                className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 transition-colors cursor-pointer"
              >
                Assign Anyway
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleValidateAndSubmit} className="mt-4 space-y-3.5">
          {/* Event Day Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Select Event Function *
            </label>
            <select
              required
              value={eventDayId}
              onChange={(e) => {
                setEventDayId(e.target.value);
                const ev = state.eventDays.find((ed) => ed.id === e.target.value);
                if (ev) {
                  setStartTime(ev.start_time);
                  setEndTime(ev.end_time);
                }
              }}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
            >
              {state.eventDays.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.event_name} ({formatDate(ed.event_date)}) - {ed.venue}
                </option>
              ))}
            </select>
          </div>

          {/* Team Member Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Crew Member *
            </label>
            <select
              required
              value={teamMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
            >
              {state.teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role}) - {formatINR(m.daily_rate)}/day
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Role on Shoot */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Assigned Role for this Event *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Candid Photographer"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Call Time (Start) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Wrap Time (End) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Daily Rate agreed for this assignment */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Agreed Shoot Rate (₹) *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="number"
                min={0}
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="10000"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Crew Instructions / Gear Requirements
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring dual 70-200 lenses, report 15 mins prior"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

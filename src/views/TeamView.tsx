import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Phone,
  Mail,
  IndianRupee,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { TeamMember, TeamCategory } from '../types';
import { formatINR, formatDate, formatTime } from '../lib/formatters';

interface TeamViewProps {
  onNewTeamMember: () => void;
  onEditTeamMember: (member: TeamMember) => void;
  onAssignCrew: (eventDayId?: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({
  onNewTeamMember,
  onEditTeamMember,
  onAssignCrew,
}) => {
  const { db, state } = useSkySuite();
  const [activeTab, setActiveTab] = useState<'roster' | 'assignments'>('roster');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const members = db.getTeamMembers();
  const assignments = db.getTeamAssignments();

  const filteredMembers = members.filter(
    (m) => categoryFilter === 'ALL' || m.category === categoryFilter
  );

  const categories = [
    'ALL',
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'CINEMATOGRAPHER',
    'DRONE_OPERATOR',
    'EDITOR',
    'ALBUM_DESIGNER',
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50">
            <button
              onClick={() => setActiveTab('roster')}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Crew Roster ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'assignments'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Event Assignments ({assignments.length})
            </button>
          </div>

          {activeTab === 'roster' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Roles' : c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAssignCrew()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-neutral-600" />
            <span>Assign Crew to Shoot</span>
          </button>
          <button
            onClick={onNewTeamMember}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Crew Member</span>
          </button>
        </div>
      </div>

      {/* Tab: Roster */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-neutral-400 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-neutral-950">{m.name}</h3>
                    <div className="text-[11px] text-neutral-600 font-medium">{m.role}</div>
                  </div>
                  <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                    {m.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-neutral-500 space-y-0.5 pt-1">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="h-3 w-3 text-neutral-400" />
                    <span>{m.phone}</span>
                  </div>
                  {m.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-neutral-400" />
                      <span className="truncate">{m.email}</span>
                    </div>
                  )}
                </div>

                {m.notes && (
                  <div className="text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded mt-2 leading-relaxed">
                    Gear: {m.notes}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-sans">Daily Rate</span>
                  <span className="font-mono font-bold text-neutral-900">{formatINR(m.daily_rate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-neutral-500 font-medium">
                    {m.employment_type.replace(/_/g, ' ')}
                  </span>
                  <button
                    onClick={() => onEditTeamMember(m)}
                    className="rounded p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Event Assignments */}
      {activeTab === 'assignments' && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Crew Member</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Event Function</th>
                  <th className="py-3 px-4">Date & Call Time</th>
                  <th className="py-3 px-4 text-right">Agreed Rate</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {assignments.map((asn) => {
                  const ev = state.eventDays.find((e) => e.id === asn.event_day_id);
                  return (
                    <tr key={asn.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-neutral-950">
                        {asn.team_member_name}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700">{asn.role}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{ev?.event_name || 'Event'}</div>
                        <div className="text-[11px] text-neutral-500">{ev?.venue}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-700">
                        <div>{formatDate(ev?.event_date)}</div>
                        <div className="text-[11px] text-neutral-500">
                          {formatTime(asn.start_time)} - {formatTime(asn.end_time)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">
                        {formatINR(asn.rate)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => db.deleteTeamAssignment(asn.id)}
                          className="rounded p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove assignment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

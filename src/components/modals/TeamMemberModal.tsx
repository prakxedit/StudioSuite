import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, IndianRupee, Briefcase } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { TeamMember, TeamCategory, EmploymentType } from '../../types';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: TeamMember | null;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
}) => {
  const { db } = useSkySuite();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<TeamCategory>('PHOTOGRAPHER');
  const [role, setRole] = useState('Lead Candid Photographer');
  const [dailyRate, setDailyRate] = useState<number | string>(10000);
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FREELANCE');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name);
      setPhone(memberToEdit.phone);
      setEmail(memberToEdit.email || '');
      setCategory(memberToEdit.category);
      setRole(memberToEdit.role);
      setDailyRate(memberToEdit.daily_rate);
      setEmploymentType(memberToEdit.employment_type);
      setNotes(memberToEdit.notes || '');
      setActive(memberToEdit.active);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setCategory('PHOTOGRAPHER');
      setRole('Lead Candid Photographer');
      setDailyRate(10000);
      setEmploymentType('FREELANCE');
      setNotes('');
      setActive(true);
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const categories: TeamCategory[] = [
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'CINEMATOGRAPHER',
    'DRONE_OPERATOR',
    'EDITOR',
    'ALBUM_DESIGNER',
    'ASSISTANT',
    'DRIVER',
    'OTHER',
  ];

  const employmentTypes: EmploymentType[] = [
    'FULL_TIME',
    'PART_TIME',
    'FREELANCE',
    'CONTRACT',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const data = {
      name,
      phone,
      email: email || undefined,
      category,
      role,
      daily_rate: Number(dailyRate) || 0,
      employment_type: employmentType,
      active,
      notes: notes || undefined,
    };

    if (memberToEdit) {
      db.updateTeamMember(memberToEdit.id, data);
    } else {
      db.addTeamMember(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {memberToEdit ? 'Edit Crew Member' : 'Add Team / Crew Member'}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Register photographers, cinematographers, drone pilots, and editors
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98451 90123"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="crew@example.com"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Primary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TeamCategory)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Designation / Role Title *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Candid Photographer"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Daily Rate & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Standard Daily Rate (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  min={0}
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="10000"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Contract / Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
              >
                {employmentTypes.map((et) => (
                  <option key={et} value={et}>
                    {et.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes & Gear Info */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Gear Kit, Camera Bodies & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sony A1 + 24-70 GM II + 50 f/1.2 GM lenses"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="memberActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
            />
            <label htmlFor="memberActive" className="text-xs font-medium text-neutral-700">
              Active team member available for assignment
            </label>
          </div>

          {/* Buttons */}
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
              {memberToEdit ? 'Save Member' : 'Add to Crew'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

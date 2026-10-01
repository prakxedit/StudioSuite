import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  IndianRupee,
  Share2,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Enquiry, EventType, LeadSource, EnquiryStatus, LostReason } from '../../types';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  enquiryToEdit?: Enquiry | null;
  onConvertToQuotation?: (enquiry: Enquiry) => void;
  onConvertToBooking?: (enquiry: Enquiry) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  enquiryToEdit,
  onConvertToQuotation,
  onConvertToBooking,
}) => {
  const { db, state } = useSkySuite();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [eventType, setEventType] = useState<EventType>('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState<number | string>(75000);
  const [leadSource, setLeadSource] = useState<LeadSource>('Instagram');
  const [notes, setNotes] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [status, setStatus] = useState<EnquiryStatus>('NEW');
  const [lostReason, setLostReason] = useState<LostReason | ''>('');

  useEffect(() => {
    if (enquiryToEdit) {
      setCustomerName(enquiryToEdit.customer_name);
      setCustomerPhone(enquiryToEdit.customer_phone);
      setCustomerEmail(enquiryToEdit.customer_email || '');
      setEventType(enquiryToEdit.event_type);
      setEventDate(enquiryToEdit.event_date || '');
      setVenue(enquiryToEdit.venue || '');
      setEstimatedBudget(enquiryToEdit.estimated_budget || '');
      setLeadSource(enquiryToEdit.lead_source);
      setNotes(enquiryToEdit.notes || '');
      setNextFollowupDate(enquiryToEdit.next_followup_date || '');
      setStatus(enquiryToEdit.status);
      setLostReason(enquiryToEdit.lost_reason || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setEventType('Wedding');
      setEventDate('');
      setVenue('');
      setEstimatedBudget(75000);
      setLeadSource('Instagram');
      setNotes('');
      setNextFollowupDate('');
      setStatus('NEW');
      setLostReason('');
    }
  }, [enquiryToEdit, isOpen]);

  if (!isOpen) return null;

  const eventTypes: EventType[] = [
    'Wedding',
    'Pre-Wedding',
    'Engagement',
    'Reception',
    'Mehendi',
    'Haldi',
    'Birthday',
    'Maternity',
    'Baby Shoot',
    'Corporate',
    'Product Shoot',
    'Other',
  ];

  const leadSources: LeadSource[] = [
    'WhatsApp',
    'Instagram',
    'Facebook',
    'Website',
    'Google',
    'Referral',
    'Walk-in',
    'Phone',
    'Other',
  ];

  const statuses: EnquiryStatus[] = [
    'NEW',
    'CONTACTED',
    'QUOTATION_SENT',
    'FOLLOW_UP',
    'NEGOTIATION',
    'BOOKED',
    'LOST',
  ];

  const lostReasons: LostReason[] = [
    'Price Too High',
    'Date Unavailable',
    'Chose Another Photographer',
    'No Response',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    const data = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || undefined,
      event_type: eventType,
      event_date: eventDate || undefined,
      venue: venue || undefined,
      estimated_budget: Number(estimatedBudget) || 0,
      lead_source: leadSource,
      notes: notes || undefined,
      next_followup_date: nextFollowupDate || undefined,
      status,
      lost_reason: status === 'LOST' ? (lostReason as LostReason) : undefined,
    };

    if (enquiryToEdit) {
      db.updateEnquiry(enquiryToEdit.id, data);
    } else {
      db.addEnquiry(data);
    }
    onClose();
  };

  const handleConvertCustomer = () => {
    if (!enquiryToEdit) return;
    db.convertEnquiryToCustomer(enquiryToEdit.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {enquiryToEdit ? 'Edit Lead / Enquiry' : 'Log New Studio Enquiry'}
            </h2>
            <p className="text-[11px] text-neutral-500">Capture lead details, dates, and budget</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Convert toolbar if editing */}
        {enquiryToEdit && (
          <div className="mt-3 flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/70 text-xs">
            <span className="font-semibold text-neutral-600 text-[11px]">Convert Lead:</span>
            <button
              type="button"
              onClick={handleConvertCustomer}
              className="px-2.5 py-1 rounded bg-white border border-neutral-200 hover:bg-neutral-100 font-medium text-neutral-800 transition-colors cursor-pointer"
            >
              + Create Customer Profile
            </button>
            {onConvertToQuotation && (
              <button
                type="button"
                onClick={() => {
                  onConvertToQuotation(enquiryToEdit);
                  onClose();
                }}
                className="px-2.5 py-1 rounded bg-white border border-neutral-200 hover:bg-neutral-100 font-medium text-neutral-800 transition-colors cursor-pointer"
              >
                + Draft Quotation
              </button>
            )}
            {onConvertToBooking && (
              <button
                type="button"
                onClick={() => {
                  onConvertToBooking(enquiryToEdit);
                  onClose();
                }}
                className="px-2.5 py-1 rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium transition-colors cursor-pointer"
              >
                + Convert to Booking
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Client / Contact Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sneha Kapur"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Phone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Event Type & Event Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Tentative Event Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Venue & Estimated Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Venue / Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. ITC Gardenia / Goa"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Estimated Client Budget (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  placeholder="75000"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium font-mono focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Lead Source & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Lead Source
              </label>
              <div className="relative">
                <Share2 className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
                >
                  {leadSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* If LOST, show reason selector */}
          {status === 'LOST' && (
            <div>
              <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                Reason Lead Was Lost
              </label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value as LostReason)}
                className="w-full rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-medium text-rose-900 focus:outline-none"
              >
                <option value="">Select reason...</option>
                {lostReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Next Followup Date */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Next Follow-up Reminder Date
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Enquiry Notes / Specific Requirements
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wants drone aerial video, asked for sample reel links..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
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
              {enquiryToEdit ? 'Update Enquiry' : 'Log Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  CalendarCheck,
} from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Booking, BookingStatus, EventType, BookingEventDay } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingToEdit?: Booking | null;
  initialCustomerId?: string;
  initialTitle?: string;
  initialBudget?: number;
  initialEventDate?: string;
  initialEventType?: EventType;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingToEdit,
  initialCustomerId,
  initialTitle,
  initialBudget,
  initialEventDate,
  initialEventType,
}) => {
  const { db, state } = useSkySuite();

  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | string>(125000);
  const [status, setStatus] = useState<BookingStatus>('CONFIRMED');
  const [notes, setNotes] = useState('');

  // Event Days attached to this booking
  const [eventDays, setEventDays] = useState<
    Array<{
      id: string;
      event_name: string;
      event_type: EventType;
      event_date: string;
      start_time: string;
      end_time: string;
      venue: string;
      venue_address?: string;
      notes?: string;
    }>
  >([]);

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

  useEffect(() => {
    if (bookingToEdit) {
      setCustomerId(bookingToEdit.customer_id);
      setTitle(bookingToEdit.title);
      setTotalAmount(bookingToEdit.total_amount);
      setStatus(bookingToEdit.status);
      setNotes(bookingToEdit.notes || '');

      const existingDays = db.getBookingEventDays(bookingToEdit.id);
      setEventDays(
        existingDays.map((ed) => ({
          id: ed.id,
          event_name: ed.event_name,
          event_type: ed.event_type,
          event_date: ed.event_date,
          start_time: ed.start_time,
          end_time: ed.end_time,
          venue: ed.venue,
          venue_address: ed.venue_address,
          notes: ed.notes,
        }))
      );
    } else {
      setCustomerId(initialCustomerId || (state.customers[0]?.id || ''));
      setTitle(initialTitle || 'Wedding & Reception Celebrations');
      setTotalAmount(initialBudget || 125000);
      setStatus('CONFIRMED');
      setNotes('');

      const defaultDate = initialEventDate || new Date().toISOString().split('T')[0];
      setEventDays([
        {
          id: 'temp-1',
          event_name: 'Main Wedding Ceremony',
          event_type: initialEventType || 'Wedding',
          event_date: defaultDate,
          start_time: '07:00',
          end_time: '14:00',
          venue: 'Grand Ballroom, Royal Orchid',
          venue_address: 'Bengaluru',
        },
      ]);
    }
  }, [bookingToEdit, isOpen, initialCustomerId, initialTitle, initialBudget, initialEventDate, initialEventType, state.customers, db]);

  if (!isOpen) return null;

  const handleAddEventDay = () => {
    setEventDays([
      ...eventDays,
      {
        id: 'temp-' + Date.now(),
        event_name: 'Reception Ceremony',
        event_type: 'Reception',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '18:30',
        end_time: '23:30',
        venue: 'Grand Banquet Hall',
      },
    ]);
  };

  const updateEventDay = (index: number, field: string, value: any) => {
    const updated = [...eventDays];
    updated[index] = { ...updated[index], [field]: value };
    setEventDays(updated);
  };

  const removeEventDay = (index: number) => {
    setEventDays(eventDays.filter((_, idx) => idx !== index));
  };

  const currentCustomer = state.customers.find((c) => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !title.trim()) return;

    if (bookingToEdit) {
      db.updateBooking(bookingToEdit.id, {
        customer_id: customerId,
        customer_name: currentCustomer?.name || bookingToEdit.customer_name,
        customer_phone: currentCustomer?.phone || bookingToEdit.customer_phone,
        title,
        total_amount: Number(totalAmount) || 0,
        status,
        notes,
      });

      // Update event days
      // For each in eventDays, either update or add
      const existing = db.getBookingEventDays(bookingToEdit.id);
      const existingIds = new Set(existing.map((e) => e.id));

      eventDays.forEach((ed) => {
        if (existingIds.has(ed.id)) {
          db.updateEventDay(ed.id, {
            event_name: ed.event_name,
            event_type: ed.event_type,
            event_date: ed.event_date,
            start_time: ed.start_time,
            end_time: ed.end_time,
            venue: ed.venue,
            venue_address: ed.venue_address,
          });
        } else {
          db.addEventDay({
            booking_id: bookingToEdit.id,
            booking_title: title,
            customer_name: currentCustomer?.name,
            customer_phone: currentCustomer?.phone,
            event_name: ed.event_name,
            event_type: ed.event_type,
            event_date: ed.event_date,
            start_time: ed.start_time,
            end_time: ed.end_time,
            venue: ed.venue,
            venue_address: ed.venue_address,
            status: 'SCHEDULED',
          });
        }
      });
      onClose();
    } else {
      const bNumber = db.generateBookingNumber();
      const newBooking = db.addBooking({
        booking_number: bNumber,
        title,
        customer_id: customerId,
        customer_name: currentCustomer?.name || 'Client',
        customer_phone: currentCustomer?.phone || '',
        total_amount: Number(totalAmount) || 0,
        status,
        notes,
      });

      // Insert event days
      eventDays.forEach((ed) => {
        db.addEventDay({
          booking_id: newBooking.id,
          booking_title: title,
          customer_name: currentCustomer?.name,
          customer_phone: currentCustomer?.phone,
          event_name: ed.event_name,
          event_type: ed.event_type,
          event_date: ed.event_date,
          start_time: ed.start_time,
          end_time: ed.end_time,
          venue: ed.venue,
          venue_address: ed.venue_address,
          status: 'SCHEDULED',
        });
      });

      // Automatically initialize 3 milestone payment schedules: 25% advance, 50% pre-event, 25% handoff
      const tot = Number(totalAmount) || 0;
      const adv = Math.round(tot * 0.25);
      const mid = Math.round(tot * 0.5);
      const bal = tot - adv - mid;
      const todayStr = new Date().toISOString().split('T')[0];

      db.addPaymentSchedule({
        booking_id: newBooking.id,
        title: 'Booking Advance (25%)',
        amount: adv,
        due_date: todayStr,
        status: 'PENDING',
      });
      db.addPaymentSchedule({
        booking_id: newBooking.id,
        title: 'Pre-Event Installment (50%)',
        amount: mid,
        due_date: eventDays[0]?.event_date || todayStr,
        status: 'PENDING',
      });
      db.addPaymentSchedule({
        booking_id: newBooking.id,
        title: 'Final Delivery (25%)',
        amount: bal,
        due_date: eventDays[eventDays.length - 1]?.event_date || todayStr,
        status: 'PENDING',
      });

      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900">
                {bookingToEdit ? `Edit Booking (${bookingToEdit.booking_number})` : 'New Commercial Booking'}
              </h2>
              <span className="font-mono text-[10px] text-neutral-500 uppercase bg-neutral-100 px-2 py-0.5 rounded">
                Agreement + Multi-Day Operations
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Commercial agreement with distinct event shoot days and payment milestones
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Top Contract Level Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Customer *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
              >
                {state.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Booking / Contract Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rahul & Pooja Grand Wedding"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Total Agreement Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="number"
                  required
                  min={0}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Status & Contract Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="TENTATIVE">TENTATIVE</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Special Contract Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VIP client, drone permissions, outdoor power..."
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Distinct Event Days Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Event Shoot Days ({eventDays.length})
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Multiple photography dates / functions (Mehendi, Haldi, Muhurtham, Reception)
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddEventDay}
                className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Event Function</span>
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {eventDays.map((ed, idx) => (
                <div
                  key={ed.id}
                  className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-neutral-500">
                      Function #{idx + 1}
                    </span>
                    {eventDays.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEventDay(idx)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                        Function Name
                      </label>
                      <input
                        type="text"
                        value={ed.event_name}
                        onChange={(e) => updateEventDay(idx, 'event_name', e.target.value)}
                        placeholder="e.g. Mehendi Ceremony"
                        className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                        Function Type
                      </label>
                      <select
                        value={ed.event_type}
                        onChange={(e) => updateEventDay(idx, 'event_type', e.target.value)}
                        className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                      >
                        {eventTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                        Date
                      </label>
                      <input
                        type="date"
                        value={ed.event_date}
                        onChange={(e) => updateEventDay(idx, 'event_date', e.target.value)}
                        className="w-full rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                        Timing (Start - End)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          value={ed.start_time}
                          onChange={(e) => updateEventDay(idx, 'start_time', e.target.value)}
                          className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-900 focus:outline-none"
                        />
                        <span className="text-neutral-400 text-xs">-</span>
                        <input
                          type="time"
                          value={ed.end_time}
                          onChange={(e) => updateEventDay(idx, 'end_time', e.target.value)}
                          className="w-full rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-neutral-600 mb-0.5">
                        Venue & Location
                      </label>
                      <input
                        type="text"
                        value={ed.venue}
                        onChange={(e) => updateEventDay(idx, 'venue', e.target.value)}
                        placeholder="e.g. Royal Orchid Resort, Yelahanka"
                        className="w-full rounded border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {bookingToEdit ? 'Save Booking Changes' : 'Confirm & Register Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

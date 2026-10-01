import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Deliverable, DeliverableStatus } from '../../types';

interface DeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverableToEdit?: Deliverable | null;
  initialBookingId?: string;
  onOpenReceipt?: (deliverable: Deliverable) => void;
}

export const DeliverableModal: React.FC<DeliverableModalProps> = ({
  isOpen,
  onClose,
  deliverableToEdit,
  initialBookingId,
  onOpenReceipt,
}) => {
  const { db, state } = useSkySuite();

  const [bookingId, setBookingId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Album');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<DeliverableStatus>('PENDING');
  const [assignedTo, setAssignedTo] = useState('Priya Sen');
  const [deliveredTo, setDeliveredTo] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    if (deliverableToEdit) {
      setBookingId(deliverableToEdit.booking_id);
      setName(deliverableToEdit.name);
      setCategory(deliverableToEdit.category);
      setQuantity(deliverableToEdit.quantity);
      setDueDate(deliverableToEdit.due_date);
      setStatus(deliverableToEdit.status);
      setAssignedTo(deliverableToEdit.assigned_to || '');
      setDeliveredTo(deliverableToEdit.delivered_to || '');
      setDeliveryNotes(deliverableToEdit.delivery_notes || '');
    } else {
      setBookingId(initialBookingId || state.bookings[0]?.id || '');
      setName('12×36 Premium Album');
      setCategory('Album');
      setQuantity(1);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
      setStatus('PENDING');
      setAssignedTo('Priya Sen');
      setDeliveredTo('');
      setDeliveryNotes('');
    }
  }, [deliverableToEdit, initialBookingId, state.bookings, isOpen]);

  if (!isOpen) return null;

  const currentBooking = state.bookings.find((b) => b.id === bookingId);
  const currentCustomer = currentBooking
    ? state.customers.find((c) => c.id === currentBooking.customer_id)
    : null;

  const categories = [
    'Album',
    'Video',
    'Frames',
    'Storage',
    'Prints',
    'Raw Data',
    'Online Gallery',
    'Other',
  ];

  const statuses: DeliverableStatus[] = [
    'PENDING',
    'IN_PROGRESS',
    'READY',
    'DELIVERED',
    'CANCELLED',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !name.trim() || !dueDate) return;

    const isNowDelivered = status === 'DELIVERED';

    const payload = {
      booking_id: bookingId,
      booking_title: currentBooking?.title,
      customer_name: currentCustomer?.name || currentBooking?.customer_name,
      customer_phone: currentCustomer?.phone || currentBooking?.customer_phone,
      name,
      category,
      quantity: Number(quantity) || 1,
      due_date: dueDate,
      status,
      assigned_to: assignedTo || undefined,
      delivered_to: deliveredTo || (isNowDelivered ? currentCustomer?.name : undefined),
      delivered_at: isNowDelivered ? new Date().toISOString() : undefined,
      delivery_notes: deliveryNotes || undefined,
    };

    if (deliverableToEdit) {
      db.updateDeliverable(deliverableToEdit.id, payload);
      if (isNowDelivered && onOpenReceipt) {
        onOpenReceipt({ ...deliverableToEdit, ...payload });
      }
    } else {
      const created = db.addDeliverable(payload);
      if (isNowDelivered && onOpenReceipt) {
        onOpenReceipt(created);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {deliverableToEdit ? 'Update Production Deliverable' : 'Track New Deliverable'}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Album production, video editing, frames, and client handoffs
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
          {/* Booking Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Booking Contract *
            </label>
            <select
              required
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
            >
              {state.bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_number} - {b.title} ({b.customer_name})
                </option>
              ))}
            </select>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Deliverable Item Name *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 12×36 Premium Canvera Album"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity, Due Date, Assigned To */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Promised Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Assigned Artist / Editor
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Priya Sen"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Status Workflow */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Production Workflow Stage *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {statuses.filter((s) => s !== 'CANCELLED').map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`rounded-lg border py-2 text-center text-xs font-semibold transition-colors cursor-pointer ${
                    status === st
                      ? 'border-neutral-900 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* If status is DELIVERED, prompt recipient name */}
          {status === 'DELIVERED' && (
            <div>
              <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                Handed Over To (Client / Representative Name)
              </label>
              <input
                type="text"
                value={deliveredTo}
                onChange={(e) => setDeliveredTo(e.target.value)}
                placeholder={currentCustomer?.name || 'Rahul Sharma'}
                className="w-full rounded-lg border border-emerald-300 bg-emerald-50/50 px-3 py-2 text-xs font-medium text-emerald-950 focus:outline-none"
              />
            </div>
          )}

          {/* Delivery Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Production & Delivery Notes
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Handover via courier / In-studio album preview confirmed"
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
              {deliverableToEdit ? 'Save Deliverable' : 'Add Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

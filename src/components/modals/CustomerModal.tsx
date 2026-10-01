import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Customer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSuccess?: (customer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onSuccess,
}) => {
  const { db } = useSkySuite();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');

  const [duplicateWarning, setDuplicateWarning] = useState<Customer | null>(null);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setAlternatePhone(customerToEdit.alternate_phone || '');
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setCity(customerToEdit.city || '');
      setStateName(customerToEdit.state || 'Karnataka');
      setPincode(customerToEdit.pincode || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setAlternatePhone('');
      setEmail('');
      setAddress('');
      setCity('Bengaluru');
      setStateName('Karnataka');
      setPincode('');
      setNotes('');
    }
    setDuplicateWarning(null);
  }, [customerToEdit, isOpen]);

  // Phone duplication check
  useEffect(() => {
    if (!phone || phone.length < 8) {
      setDuplicateWarning(null);
      return;
    }
    const existing = db.findCustomerByPhone(phone);
    if (existing && existing.id !== customerToEdit?.id) {
      setDuplicateWarning(existing);
    } else {
      setDuplicateWarning(null);
    }
  }, [phone, customerToEdit, db]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (customerToEdit) {
      db.updateCustomer(customerToEdit.id, {
        name,
        phone,
        alternate_phone: alternatePhone,
        email,
        address,
        city,
        state: stateName,
        pincode,
        notes,
      });
      onClose();
    } else {
      const created = db.addCustomer({
        name,
        phone,
        alternate_phone: alternatePhone,
        email,
        address,
        city,
        state: stateName,
        pincode,
        notes,
      });
      if (onSuccess) onSuccess(created);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {customerToEdit ? 'Edit Customer Profile' : 'New Customer Profile'}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Client details for bookings, proposals, and communication
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Duplicate phone alert */}
        {duplicateWarning && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold">Duplicate Phone Warning:</span> Another customer
              (&ldquo;{duplicateWarning.name}&rdquo;) is already registered with this phone number.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Customer / Couple Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma / Rahul & Pooja"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Primary & Alternate Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Primary Phone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Alternate Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  placeholder="Optional alternate"
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
                placeholder="client@example.com"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Billing / Residential Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Apartment, Street, Area"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* City, State, Pincode */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">State</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Karnataka"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560038"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Internal Client Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requirements, family background, reference notes..."
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
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
              {customerToEdit ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

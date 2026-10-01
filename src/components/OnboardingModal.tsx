import React, { useState } from 'react';
import { Camera, Check, ChevronRight, ChevronLeft, Sparkles, Building2, X } from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { BusinessType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { db } = useSkySuite();
  const [step, setStep] = useState(1);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [businessType, setBusinessType] = useState<BusinessType>('Photography Studio');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Photography',
    'Videography',
    'Cinematic',
    'Drone',
    'Album',
  ]);

  if (!isOpen) return null;

  const businessTypeOptions: BusinessType[] = [
    'Photography Studio',
    'Photographer',
    'Videographer',
    'Creative Studio',
    'Photo/Colour Lab',
    'Other',
  ];

  const availableServices = [
    'Photography',
    'Videography',
    'Cinematic',
    'Drone',
    'Album',
    'Printing',
    'Photo Editing',
    'Other',
  ];

  const toggleService = (srv: string) => {
    if (selectedServices.includes(srv)) {
      setSelectedServices(selectedServices.filter((s) => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !ownerName || !phone) return;

    db.createOrganization({
      businessName,
      ownerName,
      phone,
      city: city || 'Bengaluru',
      state: stateName || 'Karnataka',
      businessType,
      services: selectedServices.length > 0 ? selectedServices : ['Photography', 'Videography'],
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-950">Welcome to SkySuite</h2>
              <p className="text-[11px] text-neutral-500">Step {step} of 6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-neutral-900' : 'bg-neutral-100'
              }`}
            />
          ))}
        </div>

        {/* Step Contents */}
        <div className="py-6">
          {step === 1 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Step 1: Studio Identity
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                What is your business name?
              </h3>
              <p className="text-xs text-neutral-500">
                This will appear on all your invoices, quotations, and client contracts.
              </p>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Luminance Studios / Royal Visuals"
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-medium focus:border-neutral-900 focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Step 2: Leadership
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Who is the studio owner or director?
              </h3>
              <p className="text-xs text-neutral-500">
                Primary authorized signatory for bookings and financial documents.
              </p>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-medium focus:border-neutral-900 focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Step 3: Direct Contact
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                What is your official studio phone / WhatsApp number?
              </h3>
              <p className="text-xs text-neutral-500">
                Used for instant client communications, quote reminders, and invoice sharing.
              </p>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm font-medium focus:border-neutral-900 focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Step 4: Location
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Where is your primary operations base?
              </h3>
              <p className="text-xs text-neutral-500">City and State in India.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Karnataka, Maharashtra"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Step 5: Business Type
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Select your primary studio model
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {businessTypeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                      businessType === type
                        ? 'border-neutral-900 bg-neutral-50 font-semibold text-neutral-950'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xs">{type}</span>
                    {businessType === type && <Check className="h-4 w-4 text-neutral-900" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Step 6: Production Services
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Select the services your studio provides
              </h3>
              <p className="text-xs text-neutral-500">
                These will pre-populate your Rate Card catalog.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((srv) => {
                  const isSelected = selectedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 font-semibold text-neutral-950'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-xs">{srv}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-neutral-900" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !businessName) return;
                if (step === 2 && !ownerName) return;
                if (step === 3 && !phone) return;
                setStep(step + 1);
              }}
              className="flex items-center gap-1 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create My Business</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  IndianRupee,
  FileSpreadsheet,
  CheckCircle2,
  Eye,
  Percent,
} from 'lucide-react';
import { useSkySuite } from '../../hooks/useSkySuite';
import { Quotation, QuotationItem, QuotationStatus } from '../../types';
import { formatINR } from '../../lib/formatters';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationToEdit?: Quotation | null;
  initialCustomerId?: string;
  initialEventTitle?: string;
  onPreview: (quotation: Quotation) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  quotationToEdit,
  initialCustomerId,
  initialEventTitle,
  onPreview,
}) => {
  const { db, state, settings } = useSkySuite();

  const [customerId, setCustomerId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(settings.default_tax || 0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(settings.quotation_terms || '');
  const [status, setStatus] = useState<QuotationStatus>('DRAFT');

  // Line items (snapshots)
  const [items, setItems] = useState<
    Array<{
      id: string;
      service_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      description?: string;
    }>
  >([]);

  useEffect(() => {
    if (quotationToEdit) {
      setCustomerId(quotationToEdit.customer_id);
      setEventTitle(quotationToEdit.event_title);
      setValidUntil(quotationToEdit.valid_until);
      setDiscount(quotationToEdit.discount);
      // derive tax %
      const sub = quotationToEdit.subtotal - quotationToEdit.discount;
      const derivedTaxPct = sub > 0 ? Math.round((quotationToEdit.tax / sub) * 100) : 0;
      setTaxPercent(derivedTaxPct);
      setNotes(quotationToEdit.notes || '');
      setTerms(quotationToEdit.terms || settings.quotation_terms || '');
      setStatus(quotationToEdit.status);
      setItems(
        quotationToEdit.items.map((itm) => ({
          id: itm.id || 'itm-' + Math.random(),
          service_name: itm.service_name,
          quantity: itm.quantity,
          unit_price: itm.unit_price,
          total_price: itm.total_price,
          description: itm.description,
        }))
      );
    } else {
      setCustomerId(initialCustomerId || (state.customers[0]?.id || ''));
      setEventTitle(initialEventTitle || 'Wedding & Reception Celebrations');
      const d = new Date();
      d.setDate(d.getDate() + 15);
      setValidUntil(d.toISOString().split('T')[0]);
      setDiscount(0);
      setTaxPercent(settings.default_tax || 18);
      setNotes('');
      setTerms(settings.quotation_terms || '');
      setStatus('DRAFT');
      setItems([
        {
          id: 'itm-1',
          service_name: 'Candid Photography & Cinematography (2 Days)',
          quantity: 2,
          unit_price: 35000,
          total_price: 70000,
          description: 'Full day coverage with high resolution masters and teaser reel.',
        },
      ]);
    }
  }, [quotationToEdit, isOpen, initialCustomerId, initialEventTitle, state.customers, settings]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: 'itm-' + Date.now(),
        service_name: 'Custom Photography Service',
        quantity: 1,
        unit_price: 15000,
        total_price: 15000,
      },
    ]);
  };

  const handleApplyPackage = (pkgId: string) => {
    const pkg = state.packages.find((p) => p.id === pkgId);
    if (!pkg) return;

    const newItems = pkg.items.map((pkgItm) => ({
      id: 'itm-' + Date.now() + Math.random(),
      service_name: pkgItm.service_name,
      quantity: pkgItm.quantity,
      unit_price: Math.round(pkgItm.price / (pkgItm.quantity || 1)),
      total_price: pkgItm.price,
      description: pkgItm.description,
    }));

    setItems([...items, ...newItems]);
  };

  const handleApplyService = (srvId: string) => {
    const srv = state.services.find((s) => s.id === srvId);
    if (!srv) return;

    setItems([
      ...items,
      {
        id: 'itm-' + Date.now(),
        service_name: srv.name,
        quantity: 1,
        unit_price: srv.default_price,
        total_price: srv.default_price,
        description: srv.unit ? `Unit: ${srv.unit}` : undefined,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: 'service_name' | 'quantity' | 'unit_price' | 'description',
    value: any
  ) => {
    const updated = [...items];
    const itm = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) : itm.quantity;
      const p = field === 'unit_price' ? Number(value) : itm.unit_price;
      itm.total_price = q * p;
    }
    updated[index] = itm;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((sum, itm) => sum + (itm.total_price || 0), 0);
  const taxableAmount = Math.max(0, subtotal - (Number(discount) || 0));
  const tax = Math.round(taxableAmount * ((Number(taxPercent) || 0) / 100));
  const grandTotal = taxableAmount + tax;

  const currentCustomer = state.customers.find((c) => c.id === customerId);

  const buildQuotationPayload = (): Quotation => {
    const qNumber = quotationToEdit ? quotationToEdit.quotation_number : db.generateQuotationNumber();
    return {
      id: quotationToEdit?.id || 'qt-' + Date.now(),
      organization_id: state.currentOrgId,
      quotation_number: qNumber,
      quotation_date: quotationToEdit?.quotation_date || new Date().toISOString().split('T')[0],
      valid_until: validUntil,
      customer_id: customerId,
      customer_name: currentCustomer?.name || 'Client',
      customer_phone: currentCustomer?.phone || '',
      event_title: eventTitle,
      subtotal,
      discount: Number(discount) || 0,
      tax,
      total: grandTotal,
      notes,
      terms,
      status,
      items: items.map((itm) => ({
        id: itm.id,
        quotation_id: quotationToEdit?.id || '',
        service_name: itm.service_name,
        quantity: itm.quantity,
        unit_price: itm.unit_price,
        total_price: itm.total_price,
        description: itm.description,
      })),
      created_at: quotationToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) return;

    const payload = buildQuotationPayload();
    if (quotationToEdit) {
      db.updateQuotation(quotationToEdit.id, payload);
    } else {
      db.addQuotation(payload);
    }
    onClose();
  };

  const handleOpenPreview = () => {
    if (!customerId || items.length === 0) return;
    const payload = buildQuotationPayload();
    onPreview(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900">
                {quotationToEdit ? `Edit Quotation (${quotationToEdit.quotation_number})` : 'New Quotation / Proposal'}
              </h2>
              <span className="font-mono text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                Snapshot Pricing Engine
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Create an itemized commercial proposal with terms and instant PDF preview
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Customer & Event Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Select Customer *
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
                Event / Project Title *
              </label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Rahul & Pooja Royal Wedding"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Package / Service Injectors */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/70 text-xs">
            <span className="font-semibold text-neutral-700 text-[11px]">Quick Insert:</span>
            {state.packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handleApplyPackage(pkg.id)}
                className="px-2.5 py-1 rounded bg-white border border-neutral-200 hover:border-neutral-900 text-neutral-800 text-[11px] font-medium transition-colors cursor-pointer"
              >
                + Package: {pkg.name} ({formatINR(pkg.price)})
              </button>
            ))}
            <div className="h-4 w-px bg-neutral-200" />
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleApplyService(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-2 py-1 rounded bg-white border border-neutral-200 text-neutral-800 text-[11px] font-medium cursor-pointer"
            >
              <option value="" disabled>
                + Insert from Rate Card...
              </option>
              {state.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatINR(s.default_price)})
                </option>
              ))}
            </select>
          </div>

          {/* Line Items Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-600 grid grid-cols-12 gap-2">
              <div className="col-span-5">Service / Deliverable</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Unit Rate (₹)</div>
              <div className="col-span-2 text-right">Total (₹)</div>
              <div className="col-span-1 text-center">Act</div>
            </div>

            <div className="divide-y divide-neutral-100 p-2 space-y-2">
              {items.map((itm, idx) => (
                <div key={itm.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5 space-y-1">
                    <input
                      type="text"
                      value={itm.service_name}
                      onChange={(e) => updateItem(idx, 'service_name', e.target.value)}
                      placeholder="Service name"
                      className="w-full rounded border border-neutral-200 px-2 py-1 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={itm.description || ''}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Deliverable details / notes (optional)"
                      className="w-full rounded border border-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      value={itm.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full rounded border border-neutral-200 px-2 py-1 text-xs text-right font-mono focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={itm.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                      className="w-full rounded border border-neutral-200 px-2 py-1 text-xs text-right font-mono focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2 text-right font-mono font-bold text-neutral-900">
                    {formatINR(itm.total_price)}
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:text-neutral-950 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Custom Line Item</span>
              </button>

              <div className="text-right text-xs space-y-1 font-mono">
                <div className="text-neutral-500">
                  Subtotal: <span className="font-semibold text-neutral-900">{formatINR(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown (Discount, Tax, Total) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/30">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Discount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-mono focus:border-neutral-900 focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                GST / Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-mono focus:border-neutral-900 focus:outline-none bg-white"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block font-mono">
                Tax Amount: {formatINR(tax)}
              </span>
            </div>
            <div className="flex flex-col justify-end text-right">
              <span className="text-[11px] font-semibold text-neutral-500">Grand Total</span>
              <span className="text-lg font-bold text-neutral-950 font-mono">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Special Client Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include custom deliverable commitments, album sizes, drone permissions..."
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Payment Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Deposit schedule, cancellation policy, outstation travel rules..."
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleOpenPreview}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4 text-neutral-600" />
              <span>Preview & Print PDF</span>
            </button>

            <div className="flex items-center gap-2">
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
                {quotationToEdit ? 'Save Quotation' : 'Create Quotation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

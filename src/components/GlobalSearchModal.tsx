import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { ActiveTab } from './Sidebar';
import { formatINR, formatDate } from '../lib/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { state } = useSkySuite();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search triggered globally
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const orgId = state.currentOrgId;

  const matchedCustomers = q
    ? state.customers.filter(
        (c) =>
          c.organization_id === orgId &&
          (c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            (c.email && c.email.toLowerCase().includes(q)))
      )
    : [];

  const matchedBookings = q
    ? state.bookings.filter(
        (b) =>
          b.organization_id === orgId &&
          (b.booking_number.toLowerCase().includes(q) ||
            b.title.toLowerCase().includes(q) ||
            b.customer_name.toLowerCase().includes(q))
      )
    : [];

  const matchedQuotations = q
    ? state.quotations.filter(
        (quot) =>
          quot.organization_id === orgId &&
          (quot.quotation_number.toLowerCase().includes(q) ||
            quot.event_title.toLowerCase().includes(q) ||
            quot.customer_name.toLowerCase().includes(q))
      )
    : [];

  const matchedInvoices = q
    ? state.invoices.filter(
        (inv) =>
          inv.organization_id === orgId &&
          (inv.invoice_number.toLowerCase().includes(q) ||
            inv.customer_name.toLowerCase().includes(q))
      )
    : [];

  const matchedPayments = q
    ? state.payments.filter(
        (p) =>
          p.organization_id === orgId &&
          (p.receipt_number.toLowerCase().includes(q) ||
            (p.reference_number && p.reference_number.toLowerCase().includes(q)) ||
            (p.customer_name && p.customer_name.toLowerCase().includes(q)))
      )
    : [];

  const totalResults =
    matchedCustomers.length +
    matchedBookings.length +
    matchedQuotations.length +
    matchedInvoices.length +
    matchedPayments.length;

  const handleSelect = (tab: ActiveTab, id?: string) => {
    onNavigate(tab, id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-neutral-200 px-4 py-3.5">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, bookings, quotations, receipts, phone numbers..."
            className="w-full bg-transparent pl-3 pr-8 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-8 text-center">
              <Search className="mx-auto h-8 w-8 text-neutral-300 stroke-[1.5]" />
              <p className="mt-2 text-xs font-medium text-neutral-700">Quick Global Search</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Type a name, phone number, quotation code (e.g. QT-2026), receipt or invoice
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Customers Section */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>Customers ({matchedCustomers.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('customers', c.id)}
                        className="flex items-center justify-between rounded-lg p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-neutral-900">{c.name}</div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {c.phone}
                            </span>
                            {c.city && <span>· {c.city}</span>}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings Section */}
              {matchedBookings.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>Bookings ({matchedBookings.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelect('bookings', b.id)}
                        className="flex items-center justify-between rounded-lg p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-neutral-500 font-semibold">{b.booking_number}</span>
                            <span className="font-semibold text-xs text-neutral-900">{b.title}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Customer: {b.customer_name} · Total: <span className="font-mono font-medium text-neutral-900">{formatINR(b.total_amount)}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quotations Section */}
              {matchedQuotations.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Quotations ({matchedQuotations.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedQuotations.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => handleSelect('quotations', q.id)}
                        className="flex items-center justify-between rounded-lg p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-neutral-500 font-semibold">{q.quotation_number}</span>
                            <span className="font-semibold text-xs text-neutral-900">{q.event_title}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {q.customer_name} · Total: <span className="font-mono font-medium text-neutral-900">{formatINR(q.total)}</span> · Status: {q.status}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Section */}
              {matchedPayments.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                    <IndianRupee className="h-3.5 w-3.5" />
                    <span>Payments & Receipts ({matchedPayments.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedPayments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('payments', p.id)}
                        className="flex items-center justify-between rounded-lg p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-neutral-500 font-semibold">{p.receipt_number}</span>
                            <span className="font-semibold text-xs text-neutral-900 font-mono">{formatINR(p.amount)}</span>
                            <span className="text-[11px] text-neutral-500">via {p.payment_method}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {p.customer_name} · {formatDate(p.payment_date)} {p.reference_number ? `· Ref: ${p.reference_number}` : ''}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Section */}
              {matchedInvoices.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase px-2 mb-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Invoices ({matchedInvoices.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => handleSelect('invoices', inv.id)}
                        className="flex items-center justify-between rounded-lg p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-neutral-500 font-semibold">{inv.invoice_number}</span>
                            <span className="font-semibold text-xs text-neutral-900">{inv.customer_name}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Total: <span className="font-mono font-medium text-neutral-900">{formatINR(inv.total)}</span> · Status: {inv.status}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  IndianRupee,
  Plus,
  Printer,
  Share2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Payment } from '../types';
import { formatINR, formatDate, createWhatsAppUrl } from '../lib/formatters';

interface PaymentsViewProps {
  onRecordPayment: () => void;
  onPreviewReceipt: (payment: Payment) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onRecordPayment,
  onPreviewReceipt,
}) => {
  const { db, state, summary } = useSkySuite();
  const [activeTab, setActiveTab] = useState<'payments' | 'schedules'>('payments');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const payments = db.getPayments();
  const schedules = db.getPaymentSchedules();

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.booking_title && p.booking_title.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || p.payment_method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const paymentMethods = ['ALL', 'UPI', 'CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER'];

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Total Contract Receivables</span>
          <div className="text-xl font-bold font-mono text-neutral-900 mt-1">
            {formatINR(summary.totalRevenue)}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Collected in Bank/Cash</span>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            {formatINR(summary.totalReceived)}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Pending Outstanding</span>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1">
            {formatINR(summary.totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-3">
          {/* Segmented Tab */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50">
            <button
              onClick={() => setActiveTab('payments')}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Payments & Receipts ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Due Schedules ({schedules.length})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipt, customer..."
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium focus:border-neutral-900 focus:outline-none w-56"
            />
          </div>
        </div>

        <button
          onClick={onRecordPayment}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Tab Content: Payments Ledger */}
      {activeTab === 'payments' && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Booking / Contract</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Receipt Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredPayments.map((p) => {
                  const shareMsg = `Receipt ${p.receipt_number} from Sky Photography Studio: Received ${formatINR(p.amount)} via ${p.payment_method} on ${formatDate(p.payment_date)}.`;
                  const waUrl = createWhatsAppUrl(p.customer_name || '', shareMsg);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onPreviewReceipt(p)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-950">
                        {p.receipt_number}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-900 font-semibold">{p.customer_name}</td>
                      <td className="py-3.5 px-4 text-neutral-600">{p.booking_title}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-600">{formatDate(p.payment_date)}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] font-semibold bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                          {p.payment_method}
                        </span>
                        {p.reference_number && (
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {p.reference_number}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-800 text-sm">
                        {formatINR(p.amount)}
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPreviewReceipt(p)}
                            className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Print / View PDF Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Payment Schedules */}
      {activeTab === 'schedules' && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Milestone</th>
                  <th className="py-3 px-4">Booking</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-950">{s.title}</td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {state.bookings.find((b) => b.id === s.booking_id)?.title || 'Booking'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-700">{formatDate(s.due_date)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatINR(s.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                          s.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

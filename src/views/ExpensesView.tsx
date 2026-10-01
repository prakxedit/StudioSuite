import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Calendar,
  IndianRupee,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Expense } from '../types';
import { formatINR, formatDate } from '../lib/formatters';

interface ExpensesViewProps {
  onNewExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onNewExpense }) => {
  const { db, state, summary } = useSkySuite();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const expenses = db.getExpenses();

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.booking_title && e.booking_title.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'ALL',
    'Staff',
    'Travel',
    'Album',
    'Printing',
    'Equipment',
    'Food',
    'Fuel',
    'Other',
  ];

  return (
    <div className="space-y-4">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Total Studio Expenses</span>
          <div className="text-xl font-bold font-mono text-rose-800 mt-1">
            {formatINR(summary.totalExpenses)}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Collected Revenue</span>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            {formatINR(summary.totalReceived)}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Estimated Net Profit</span>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            {formatINR(summary.estimatedProfit)}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses, bookings..."
              className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onNewExpense}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Expense List */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-neutral-900">No expenses recorded</p>
            <p className="text-xs text-neutral-500 mt-1">
              Track crew payouts, fuel, album printing, and equipment maintenance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Attributed Project</th>
                  <th className="py-3 px-4">Paid Via</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-950 font-semibold">{exp.description}</td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {exp.booking_title || <span className="text-neutral-400 italic">General Studio</span>}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">
                      {exp.payment_method}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-800 text-sm">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => db.deleteExpense(exp.id)}
                        className="rounded p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

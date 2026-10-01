import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  IndianRupee,
  Users,
  PackageCheck,
  CalendarCheck,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { formatINR } from '../lib/formatters';

export const ReportsView: React.FC = () => {
  const { db, state, summary } = useSkySuite();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  // Breakdown of expenses by category
  const expenseByCategory = state.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  // Crew Workload
  const crewWorkload = state.teamMembers.map((m) => {
    const assigned = state.teamAssignments.filter((a) => a.team_member_id === m.id);
    const totalEarnings = assigned.reduce((sum, a) => sum + a.rate, 0);
    return {
      member: m,
      assignmentsCount: assigned.length,
      totalEarnings,
    };
  });

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Studio Performance & Financial Reports</h2>
          <p className="text-[11px] text-neutral-500">
            Real-time accounting, revenue collection, profitability, and crew workload
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50">
          {(['today', 'week', 'month', 'year', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`rounded px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                dateRange === r
                  ? 'bg-white text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {r === 'all' ? 'All Time' : `This ${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Commercial Pipeline</span>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            {formatINR(summary.totalRevenue)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Total contract value</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Collected Revenue</span>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            {formatINR(summary.totalReceived)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Net bank realization</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Production Costs</span>
          <div className="text-xl font-bold font-mono text-rose-800 mt-1">
            {formatINR(summary.totalExpenses)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Crew, printing, travel</div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-500">Estimated Studio Profit</span>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            {formatINR(summary.estimatedProfit)}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1">
            {summary.totalReceived > 0
              ? `${Math.round((summary.estimatedProfit / summary.totalReceived) * 100)}% profit margin`
              : '0% margin'}
          </div>
        </div>
      </div>

      {/* Visual Ledger Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Collection Health */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Revenue Realization Breakdown
              </h3>
              <p className="text-[11px] text-neutral-500">Collections vs outstanding receivables</p>
            </div>
            <span className="font-mono text-xs font-bold text-neutral-900">
              {formatINR(summary.totalRevenue)}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-emerald-800">Collected in Bank ({formatINR(summary.totalReceived)})</span>
                <span className="font-mono font-bold text-emerald-800">
                  {summary.totalRevenue > 0
                    ? `${Math.round((summary.totalReceived / summary.totalRevenue) * 100)}%`
                    : '100%'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${summary.totalRevenue > 0 ? Math.min(100, Math.round((summary.totalReceived / summary.totalRevenue) * 100)) : 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-amber-800">Outstanding Due ({formatINR(summary.totalOutstanding)})</span>
                <span className="font-mono font-bold text-amber-800">
                  {summary.totalRevenue > 0
                    ? `${Math.round((summary.totalOutstanding / summary.totalRevenue) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${summary.totalRevenue > 0 ? Math.min(100, Math.round((summary.totalOutstanding / summary.totalRevenue) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Production Expenses by Category
              </h3>
              <p className="text-[11px] text-neutral-500">Staff, travel, album printing & gear</p>
            </div>
            <span className="font-mono text-xs font-bold text-rose-800">
              {formatINR(summary.totalExpenses)}
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(expenseByCategory).length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">No expenses recorded.</div>
            ) : (
              Object.entries(expenseByCategory).map(([cat, amt]) => {
                const pct = summary.totalExpenses > 0 ? Math.round((amt / summary.totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-neutral-800">{cat}</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatINR(amt)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Crew Workload & Payroll Ledger */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs p-5 space-y-3">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Crew Workload & Assigned Shoot Days
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Crew Member</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Shoot Assignments</th>
                <th className="py-2.5 px-3 text-right">Daily Rate</th>
                <th className="py-2.5 px-3 text-right">Total Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {crewWorkload.map((cw) => (
                <tr key={cw.member.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-neutral-950">{cw.member.name}</div>
                    <div className="text-[11px] text-neutral-500">{cw.member.role}</div>
                  </td>
                  <td className="py-3 px-3 text-neutral-600">{cw.member.category.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-800">
                    {cw.assignmentsCount} function(s)
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-600">
                    {formatINR(cw.member.daily_rate)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-950">
                    {formatINR(cw.totalEarnings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

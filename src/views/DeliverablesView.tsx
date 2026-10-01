import React, { useState } from 'react';
import {
  PackageCheck,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Printer,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Deliverable, DeliverableStatus } from '../types';
import { formatDate, isOverdue } from '../lib/formatters';

interface DeliverablesViewProps {
  onNewDeliverable: () => void;
  onEditDeliverable: (deliverable: Deliverable) => void;
  onPreviewReceipt: (deliverable: Deliverable) => void;
}

export const DeliverablesView: React.FC<DeliverablesViewProps> = ({
  onNewDeliverable,
  onEditDeliverable,
  onPreviewReceipt,
}) => {
  const { db, state } = useSkySuite();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const deliverables = db.getDeliverables();

  const filtered = deliverables.filter((d) => {
    return statusFilter === 'ALL' || d.status === statusFilter;
  });

  const statuses = ['ALL', 'PENDING', 'IN_PROGRESS', 'READY', 'DELIVERED'];

  const advanceStatus = (del: Deliverable) => {
    const nextMap: Record<DeliverableStatus, DeliverableStatus> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'READY',
      READY: 'DELIVERED',
      DELIVERED: 'DELIVERED',
      CANCELLED: 'PENDING',
    };
    const nextSt = nextMap[del.status];
    db.updateDeliverable(del.id, {
      status: nextSt,
      ready_at: nextSt === 'READY' ? new Date().toISOString() : del.ready_at,
      delivered_at: nextSt === 'DELIVERED' ? new Date().toISOString() : del.delivered_at,
      delivered_to: nextSt === 'DELIVERED' && !del.delivered_to ? del.customer_name : del.delivered_to,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50 overflow-x-auto">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded px-3 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-neutral-950 font-bold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {st.toLowerCase().replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={onNewDeliverable}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Deliverable</span>
        </button>
      </div>

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-neutral-200">
            <p className="text-sm font-semibold text-neutral-900">No deliverables in this view</p>
            <p className="text-xs text-neutral-500 mt-1">
              Track luxury photobook albums, film teasers, and pendrives from proofing to handover.
            </p>
          </div>
        ) : (
          filtered.map((d) => {
            const overdue = d.status !== 'DELIVERED' && isOverdue(d.due_date);

            return (
              <div
                key={d.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-neutral-400 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-neutral-950">{d.name}</h3>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{d.booking_title}</div>
                    </div>
                    <span className="font-mono text-[10px] font-semibold uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                      {d.category}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Quantity:</span>
                      <span className="font-mono font-bold text-neutral-900">{d.quantity} unit(s)</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Promised Due:</span>
                      <span
                        className={`font-mono font-medium ${
                          overdue ? 'text-rose-700 font-bold' : 'text-neutral-800'
                        }`}
                      >
                        {formatDate(d.due_date)} {overdue && '⚠️ OVERDUE'}
                      </span>
                    </div>

                    {d.assigned_to && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500">Handled By:</span>
                        <span className="font-medium text-neutral-800">{d.assigned_to}</span>
                      </div>
                    )}
                  </div>

                  {d.delivery_notes && (
                    <div className="text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded leading-snug">
                      {d.delivery_notes}
                    </div>
                  )}
                </div>

                {/* Workflow Footer */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      d.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : d.status === 'READY'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {d.status.replace(/_/g, ' ')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {d.status !== 'DELIVERED' ? (
                      <button
                        onClick={() => advanceStatus(d)}
                        className="rounded bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        {d.status === 'PENDING'
                          ? 'Start Work'
                          : d.status === 'IN_PROGRESS'
                          ? 'Mark Ready'
                          : 'Deliver'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onPreviewReceipt(d)}
                        className="flex items-center gap-1 rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                        title="Print Delivery Receipt"
                      >
                        <Printer className="h-3 w-3" />
                        <span>Receipt</span>
                      </button>
                    )}
                    <button
                      onClick={() => onEditDeliverable(d)}
                      className="rounded p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

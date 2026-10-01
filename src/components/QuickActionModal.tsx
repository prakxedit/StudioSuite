import React from 'react';
import {
  X,
  UserPlus,
  Inbox,
  FileSpreadsheet,
  CalendarCheck,
  IndianRupee,
  TrendingDown,
  PackageCheck,
} from 'lucide-react';

export type QuickActionType =
  | 'new_customer'
  | 'new_enquiry'
  | 'new_quotation'
  | 'new_booking'
  | 'receive_payment'
  | 'new_expense'
  | 'new_deliverable';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: QuickActionType) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'new_customer' as QuickActionType,
      title: 'New Customer',
      desc: 'Add client profile with contact and wedding dates',
      icon: UserPlus,
      color: 'bg-neutral-900 text-white',
    },
    {
      id: 'new_enquiry' as QuickActionType,
      title: 'New Enquiry / Lead',
      desc: 'Log lead from Instagram, WhatsApp, or referral',
      icon: Inbox,
      color: 'bg-neutral-900 text-white',
    },
    {
      id: 'new_quotation' as QuickActionType,
      title: 'New Quotation',
      desc: 'Build itemized estimate with snapshot pricing',
      icon: FileSpreadsheet,
      color: 'bg-neutral-900 text-white',
    },
    {
      id: 'new_booking' as QuickActionType,
      title: 'New Booking',
      desc: 'Register commercial contract with multiple event days',
      icon: CalendarCheck,
      color: 'bg-neutral-900 text-white',
    },
    {
      id: 'receive_payment' as QuickActionType,
      title: 'Receive Payment',
      desc: 'Record cash, UPI, or NEFT and issue instant receipt',
      icon: IndianRupee,
      color: 'bg-neutral-900 text-white',
    },
    {
      id: 'new_expense' as QuickActionType,
      title: 'New Expense',
      desc: 'Track crew, travel, gear, or printing costs',
      icon: TrendingDown,
      color: 'bg-neutral-900 text-white',
    },
    {
      id: 'new_deliverable' as QuickActionType,
      title: 'New Deliverable',
      desc: 'Track photobook albums, film teasers, and pendrives',
      icon: PackageCheck,
      color: 'bg-neutral-900 text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Quick Actions</h2>
            <p className="text-[11px] text-neutral-500">Fast workflows for studio operations</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 text-left hover:border-neutral-900 hover:bg-neutral-50/80 transition-all cursor-pointer group"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${act.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-950">
                    {act.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5 leading-snug">
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Inbox,
  FileSpreadsheet,
  CalendarCheck,
  CalendarDays,
  IndianRupee,
  FileText,
  PackageCheck,
  Briefcase,
  TrendingDown,
  BarChart3,
  Settings,
  Plus,
  Camera,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { UserRole } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'customers'
  | 'enquiries'
  | 'quotations'
  | 'bookings'
  | 'calendar'
  | 'payments'
  | 'invoices'
  | 'deliverables'
  | 'team'
  | 'expenses'
  | 'reports'
  | 'services'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openQuickAction: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openQuickAction,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { currentOrg, state, db } = useSkySuite();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'enquiries', label: 'Enquiries & CRM', icon: Inbox },
    { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
    { id: 'bookings', label: 'Bookings & Events', icon: CalendarCheck },
    { id: 'calendar', label: 'Event Calendar', icon: CalendarDays },
    { id: 'payments', label: 'Payments & Receipts', icon: IndianRupee },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'deliverables', label: 'Deliverables', icon: PackageCheck },
    { id: 'team', label: 'Team & Roster', icon: Briefcase },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'reports', label: 'Reports & Profit', icon: BarChart3 },
    { id: 'services', label: 'Services & Packages', icon: Layers },
    { id: 'settings', label: 'Studio Settings', icon: Settings },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs">
              <Camera className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-neutral-950 text-base">SKYSUITE</span>
              </div>
              <p className="text-[11px] text-neutral-600 font-medium truncate max-w-[130px]">
                {currentOrg?.name || 'Studio Suite'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={openQuickAction}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-950 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Action</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-neutral-950' : 'text-neutral-600 group-hover:text-neutral-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Organization / Role Switcher Footer */}
        <div className="border-t border-neutral-100 p-3 bg-neutral-50/70">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="truncate">
              <p className="text-xs font-medium text-neutral-900 truncate">
                {currentOrg?.owner_name || 'Studio Manager'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-neutral-600 font-mono">Role:</span>
                <select
                  value={state.currentUserRole}
                  onChange={(e) => db.setCurrentUserRole(e.target.value as UserRole)}
                  className="text-[11px] font-semibold text-neutral-700 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="STAFF">STAFF</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
              <span>Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building,
  PlusCircle,
  X,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { ActiveTab } from './Sidebar';
import { formatDate } from '../lib/formatters';

interface TopHeaderProps {
  activeTab: ActiveTab;
  onOpenSearch: () => void;
  onOpenOnboarding: () => void;
  onToggleMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenSearch,
  onOpenOnboarding,
  onToggleMobileMenu,
}) => {
  const { currentOrg, state, db } = useSkySuite();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = db.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabTitles: Record<ActiveTab, { title: string; category: string }> = {
    dashboard: { title: 'Studio Overview', category: 'Executive' },
    customers: { title: 'Customer Directory', category: 'CRM' },
    enquiries: { title: 'Enquiry Pipeline', category: 'Leads' },
    quotations: { title: 'Quotations & Estimates', category: 'Sales' },
    bookings: { title: 'Bookings & Event Days', category: 'Commercial' },
    calendar: { title: 'Event Production Calendar', category: 'Operations' },
    payments: { title: 'Payment Ledger & Receipts', category: 'Finance' },
    invoices: { title: 'Invoices & Billing', category: 'Finance' },
    deliverables: { title: 'Deliverables & Production', category: 'Fulfillment' },
    team: { title: 'Team Roster & Crew Assignments', category: 'Crew' },
    expenses: { title: 'Studio Expenses & Log', category: 'Finance' },
    reports: { title: 'Profit & Performance Reports', category: 'Analytics' },
    services: { title: 'Rate Card & Packages', category: 'Catalog' },
    settings: { title: 'Business Profile & Bank Details', category: 'Config' },
  };

  const currentMeta = tabTitles[activeTab] || { title: 'Studio Suite', category: 'SkySuite' };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/95 px-4 md:px-6 backdrop-blur-xs">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 md:hidden cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 font-medium hidden sm:inline">{currentMeta.category}</span>
          <span className="text-neutral-300 hidden sm:inline">/</span>
          <h1 className="text-sm font-semibold text-neutral-900 tracking-tight">{currentMeta.title}</h1>
        </div>
      </div>

      {/* Right zone: Global Search trigger, Notifications, New Studio */}
      <div className="flex items-center gap-2.5">
        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-500 hover:border-neutral-300 hover:bg-white hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Search anything...</span>
          <kbd className="hidden rounded bg-neutral-200/60 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600 md:inline">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-950 font-mono text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg z-50">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-neutral-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => db.markAllNotificationsRead()}
                      className="text-[11px] text-neutral-600 hover:text-neutral-950 cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 py-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        db.markNotificationRead(notif.id);
                      }}
                      className={`p-2.5 text-xs transition-colors cursor-pointer rounded-lg ${
                        notif.read ? 'opacity-70 hover:bg-neutral-50' : 'bg-neutral-50/80 hover:bg-neutral-100/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-900">
                          {notif.type === 'EVENT' && <Calendar className="h-3.5 w-3.5 text-neutral-700" />}
                          {notif.type === 'PAYMENT' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          {notif.type === 'FOLLOWUP' && <AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
                          <span>{notif.title}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                          {formatDate(notif.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-neutral-600 text-[11px] leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Organization button */}
        <button
          onClick={onOpenOnboarding}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          title="Create a new studio organization"
        >
          <PlusCircle className="h-3.5 w-3.5 text-neutral-500" />
          <span>New Studio</span>
        </button>
      </div>
    </header>
  );
};

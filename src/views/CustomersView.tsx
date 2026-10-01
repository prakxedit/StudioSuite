import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  MessageSquare,
  MapPin,
  CalendarCheck,
  IndianRupee,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { Customer } from '../types';
import { formatINR, createWhatsAppUrl } from '../lib/formatters';

interface CustomersViewProps {
  onSelectCustomer: (customer: Customer) => void;
  onNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onNewBookingForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onSelectCustomer,
  onNewCustomer,
  onEditCustomer,
  onNewBookingForCustomer,
}) => {
  const { state, db } = useSkySuite();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');

  const customers = db.getCustomers();

  // Unique cities for filtering
  const cities = ['ALL', ...Array.from(new Set(customers.map((c) => c.city).filter(Boolean)))];

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()));

    const matchesCity = cityFilter === 'ALL' || c.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, phone, or email..."
              className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === 'ALL' ? 'All Cities' : city}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onNewCustomer}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customer Directory Table / Responsive Grid */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-neutral-900">No customers found</p>
            <p className="text-xs text-neutral-500 mt-1">
              {search ? 'Try clearing your search filters.' : 'Add your first customer to start tracking bookings.'}
            </p>
            {!search && (
              <button
                onClick={onNewCustomer}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Bookings</th>
                  <th className="py-3 px-4 text-right">Total Value</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredCustomers.map((c) => {
                  const fin = db.getCustomerFinancials(c.id);
                  const waUrl = createWhatsAppUrl(c.phone);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-neutral-950 group-hover:text-neutral-900">
                          {c.name}
                        </div>
                        {c.notes && (
                          <div className="text-[11px] text-neutral-400 truncate max-w-xs font-normal">
                            {c.notes}
                          </div>
                        )}
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-neutral-800">{c.phone}</div>
                        {c.email && (
                          <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                            {c.email}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {c.city ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-neutral-400" />
                            {c.city}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Bookings Count */}
                      <td className="py-3.5 px-4 text-right font-mono text-neutral-800">
                        {fin.bookingCount}
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">
                        {formatINR(fin.totalValue)}
                      </td>

                      {/* Outstanding */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={fin.outstanding > 0 ? 'text-amber-800' : 'text-neutral-900'}>
                          {formatINR(fin.outstanding)}
                        </span>
                      </td>

                      {/* Quick Communication & Actions */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-neutral-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                          <a
                            href={`tel:${c.phone}`}
                            className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => onEditCustomer(c)}
                            className="rounded p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit customer profile"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

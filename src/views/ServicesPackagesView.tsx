import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Check, IndianRupee } from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { ServiceItem, Package } from '../types';
import { formatINR } from '../lib/formatters';

export const ServicesPackagesView: React.FC = () => {
  const { db, state } = useSkySuite();
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('packages');

  // Service form state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Photography');
  const [servicePrice, setServicePrice] = useState<number | string>(20000);
  const [serviceUnit, setServiceUnit] = useState('per day');

  const services = db.getServices();
  const packages = db.getPackages();

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    db.addService({
      name: serviceName,
      category: serviceCategory,
      default_price: Number(servicePrice) || 0,
      unit: serviceUnit,
      active: true,
    });

    setServiceName('');
    setShowServiceModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-200 p-1 bg-neutral-50">
          <button
            onClick={() => setActiveTab('packages')}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Bundled Packages ({packages.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`rounded px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'bg-white text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Rate Card Services ({services.length})
          </button>
        </div>

        <button
          onClick={() => setShowServiceModal(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service to Rate Card</span>
        </button>
      </div>

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-neutral-400 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-950">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{pkg.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-base font-bold text-neutral-950">
                      {formatINR(pkg.price)}
                    </span>
                    <span className="text-[10px] text-neutral-400 block font-sans">Package Price</span>
                  </div>
                </div>

                {/* Package Items Bundle */}
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-2">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Included Services ({pkg.items.length})
                  </span>
                  <div className="space-y-1.5">
                    {pkg.items.map((itm) => (
                      <div
                        key={itm.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-neutral-50 border border-neutral-100"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium text-neutral-800">{itm.service_name}</span>
                        </div>
                        <span className="font-mono text-neutral-600 text-[11px]">
                          Qty: {itm.quantity} · {formatINR(itm.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Active in Quotations
                </span>
                <button
                  onClick={() => db.deletePackage(pkg.id)}
                  className="rounded p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove package"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Services Rate Card Tab */}
      {activeTab === 'services' && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Measure</th>
                  <th className="py-3 px-4 text-right">Standard Price</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-950">{srv.name}</td>
                    <td className="py-3.5 px-4 text-neutral-600">{srv.category}</td>
                    <td className="py-3.5 px-4 text-neutral-500 font-mono text-[11px]">{srv.unit}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-neutral-900">
                      {formatINR(srv.default_price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => db.deleteService(srv.id)}
                        className="rounded p-1 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Add Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h2 className="text-sm font-bold text-neutral-900">Add Service to Rate Card</h2>
              <button
                onClick={() => setShowServiceModal(false)}
                className="rounded p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddService} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Traditional Photography"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none bg-white"
                  >
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Drone">Drone</option>
                    <option value="Album">Album</option>
                    <option value="Editing">Editing</option>
                    <option value="Frame">Frame</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Rate (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="20000"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={serviceUnit}
                  onChange={(e) => setServiceUnit(e.target.value)}
                  placeholder="e.g. per day / per album / per video"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

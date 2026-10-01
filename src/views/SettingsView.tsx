import React, { useState } from 'react';
import {
  Settings,
  Building,
  CreditCard,
  FileText,
  Database,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { useSkySuite } from '../hooks/useSkySuite';
import { isLiveSupabaseConfigured } from '../lib/supabase/client';

export const SettingsView: React.FC = () => {
  const { currentOrg, settings, db, state } = useSkySuite();

  // Organization form state
  const [businessName, setBusinessName] = useState(currentOrg?.business_name || '');
  const [ownerName, setOwnerName] = useState(currentOrg?.owner_name || '');
  const [phone, setPhone] = useState(currentOrg?.phone || '');
  const [email, setEmail] = useState(currentOrg?.email || '');
  const [address, setAddress] = useState(currentOrg?.address || '');
  const [city, setCity] = useState(currentOrg?.city || '');
  const [stateName, setStateName] = useState(currentOrg?.state || '');
  const [pincode, setPincode] = useState(currentOrg?.pincode || '');
  const [gstNumber, setGstNumber] = useState(currentOrg?.gst_number || '');

  // Prefixes
  const [invoicePrefix, setInvoicePrefix] = useState(currentOrg?.invoice_prefix || 'INV-2026-');
  const [quotationPrefix, setQuotationPrefix] = useState(currentOrg?.quotation_prefix || 'QT-2026-');
  const [receiptPrefix, setReceiptPrefix] = useState(currentOrg?.receipt_prefix || 'REC-2026-');

  // Banking & UPI
  const [bankName, setBankName] = useState(settings.bank_name || '');
  const [accountName, setAccountName] = useState(settings.account_name || '');
  const [accountNumber, setAccountNumber] = useState(settings.account_number || '');
  const [ifscCode, setIfscCode] = useState(settings.ifsc_code || '');
  const [upiId, setUpiId] = useState(settings.upi_id || '');
  const [defaultTax, setDefaultTax] = useState<number>(settings.default_tax || 0);
  const [paymentTerms, setPaymentTerms] = useState(settings.payment_terms || '');
  const [quotationTerms, setQuotationTerms] = useState(settings.quotation_terms || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    db.updateOrganization({
      business_name: businessName,
      name: businessName,
      owner_name: ownerName,
      phone,
      email,
      address,
      city,
      state: stateName,
      pincode,
      gst_number: gstNumber,
      invoice_prefix: invoicePrefix,
      quotation_prefix: quotationPrefix,
      receipt_prefix: receiptPrefix,
    });

    db.updateOrgSettings({
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      upi_id: upiId,
      default_tax: defaultTax,
      payment_terms: paymentTerms,
      quotation_terms: quotationTerms,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset SkySuite to initial demo data (Sky Photography Studio)? All custom test records will be refreshed.')) {
      db.resetToDemo();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `skysuite_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Studio Settings & Credentials</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure studio legal entity, GSTIN, remittance bank credentials, and numbering
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Demo Data</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Studio settings and payment terms saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Studio Identity & Address */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <Building className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Studio Identity & Registration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Studio / Business Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Owner / Authorized Signatory *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Studio Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Studio Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="29ABCDE1234F1Z5"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
              Studio Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Suite 402, Signature Pinnacle, Indiranagar"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">State</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Banking and UPI Credentials */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <CreditCard className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Bank Account & Official UPI Remittance
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank Ltd"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Sky Photography Studio"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="50200034891234"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="HDFC0001234"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                UPI ID (Google Pay / PhonePe)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="skyphotostudio@okhdfcbank"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Prefixes & Taxes */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
            <FileText className="h-4 w-4 text-neutral-500" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Document Numbering & Taxes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Invoice Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Quotation Prefix
              </label>
              <input
                type="text"
                value={quotationPrefix}
                onChange={(e) => setQuotationPrefix(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Receipt Prefix
              </label>
              <input
                type="text"
                value={receiptPrefix}
                onChange={(e) => setReceiptPrefix(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Default GST Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={defaultTax}
                onChange={(e) => setDefaultTax(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-mono font-semibold focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Default Quotation Terms
              </label>
              <textarea
                rows={3}
                value={quotationTerms}
                onChange={(e) => setQuotationTerms(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Default Payment Terms
              </label>
              <textarea
                rows={3}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Database & Supabase Status Panel */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-neutral-500" />
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Database & Cloud Storage Architecture
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {isLiveSupabaseConfigured ? (
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Live Supabase Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Embedded Reactive DB (Persistent)
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            SkySuite runs with zero setup out of the box using a persistent browser database preloaded with realistic Indian photography studio operations. To synchronize with your production PostgreSQL Supabase project, execute the migration in <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px] font-mono">/supabase/migrations/20260101000000_skysuite_init.sql</code> and set <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px] font-mono">VITE_SUPABASE_URL</code> and <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px] font-mono">VITE_SUPABASE_ANON_KEY</code>.
          </p>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-lg bg-neutral-950 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Save All Studio Settings
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { QuickActionModal, QuickActionType } from './components/QuickActionModal';
import { OnboardingModal } from './components/OnboardingModal';

// Modals
import { CustomerModal } from './components/modals/CustomerModal';
import { CustomerDetailDrawer } from './components/modals/CustomerDetailDrawer';
import { EnquiryModal } from './components/modals/EnquiryModal';
import { QuotationModal } from './components/modals/QuotationModal';
import { QuotationPrintView } from './components/modals/QuotationPrintView';
import { BookingModal } from './components/modals/BookingModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptPrintView } from './components/modals/ReceiptPrintView';
import { InvoiceModal } from './components/modals/InvoiceModal';
import { InvoicePrintView } from './components/modals/InvoicePrintView';
import { TeamMemberModal } from './components/modals/TeamMemberModal';
import { TeamAssignmentModal } from './components/modals/TeamAssignmentModal';
import { DeliverableModal } from './components/modals/DeliverableModal';
import { DeliverableReceiptView } from './components/modals/DeliverableReceiptView';
import { ExpenseModal } from './components/modals/ExpenseModal';

// Views
import { DashboardView } from './views/DashboardView';
import { CustomersView } from './views/CustomersView';
import { EnquiriesView } from './views/EnquiriesView';
import { QuotationsView } from './views/QuotationsView';
import { BookingsView } from './views/BookingsView';
import { CalendarView } from './views/CalendarView';
import { PaymentsView } from './views/PaymentsView';
import { InvoicesView } from './views/InvoicesView';
import { DeliverablesView } from './views/DeliverablesView';
import { TeamView } from './views/TeamView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { ServicesPackagesView } from './views/ServicesPackagesView';
import { SettingsView } from './views/SettingsView';

import {
  Customer,
  Enquiry,
  Quotation,
  Booking,
  Payment,
  Invoice,
  TeamMember,
  Deliverable,
  BookingEventDay,
} from './types';
import { useSkySuite } from './hooks/useSkySuite';

export default function App() {
  const { db, state } = useSkySuite();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Dialogs
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Entity Modals & Detail Drawers
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryToEdit, setEnquiryToEdit] = useState<Enquiry | null>(null);

  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationToEdit, setQuotationToEdit] = useState<Quotation | null>(null);
  const [quotationPreview, setQuotationPreview] = useState<Quotation | null>(null);
  const [quotationInitialCustId, setQuotationInitialCustId] = useState<string | undefined>();
  const [quotationInitialTitle, setQuotationInitialTitle] = useState<string | undefined>();

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [bookingInitialCustId, setBookingInitialCustId] = useState<string | undefined>();
  const [bookingInitialTitle, setBookingInitialTitle] = useState<string | undefined>();
  const [bookingInitialBudget, setBookingInitialBudget] = useState<number | undefined>();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentInitialBookingId, setPaymentInitialBookingId] = useState<string | undefined>();
  const [receiptPreview, setReceiptPreview] = useState<Payment | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [invoiceInitialBookingId, setInvoiceInitialBookingId] = useState<string | undefined>();
  const [invoicePreview, setInvoicePreview] = useState<Invoice | null>(null);

  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [teamMemberToEdit, setTeamMemberToEdit] = useState<TeamMember | null>(null);
  const [isTeamAssignmentModalOpen, setIsTeamAssignmentModalOpen] = useState(false);
  const [assignmentInitialEventDayId, setAssignmentInitialEventDayId] = useState<string | undefined>();

  const [isDeliverableModalOpen, setIsDeliverableModalOpen] = useState(false);
  const [deliverableToEdit, setDeliverableToEdit] = useState<Deliverable | null>(null);
  const [deliverableReceiptPreview, setDeliverableReceiptPreview] = useState<Deliverable | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseInitialBookingId, setExpenseInitialBookingId] = useState<string | undefined>();

  // Quick Action Handler
  const handleSelectQuickAction = (action: QuickActionType) => {
    switch (action) {
      case 'new_customer':
        setCustomerToEdit(null);
        setIsCustomerModalOpen(true);
        break;
      case 'new_enquiry':
        setEnquiryToEdit(null);
        setIsEnquiryModalOpen(true);
        break;
      case 'new_quotation':
        setQuotationToEdit(null);
        setQuotationInitialCustId(undefined);
        setQuotationInitialTitle(undefined);
        setIsQuotationModalOpen(true);
        break;
      case 'new_booking':
        setBookingToEdit(null);
        setBookingInitialCustId(undefined);
        setBookingInitialTitle(undefined);
        setBookingInitialBudget(undefined);
        setIsBookingModalOpen(true);
        break;
      case 'receive_payment':
        setPaymentInitialBookingId(undefined);
        setIsPaymentModalOpen(true);
        break;
      case 'new_expense':
        setExpenseInitialBookingId(undefined);
        setIsExpenseModalOpen(true);
        break;
      case 'new_deliverable':
        setDeliverableToEdit(null);
        setIsDeliverableModalOpen(true);
        break;
    }
  };

  // Global Navigation
  const handleGlobalNavigate = (tab: ActiveTab, entityId?: string) => {
    setActiveTab(tab);
    if (tab === 'customers' && entityId) {
      const c = state.customers.find((cust) => cust.id === entityId);
      if (c) setSelectedCustomerDetail(c);
    }
    if (tab === 'quotations' && entityId) {
      const q = state.quotations.find((quot) => quot.id === entityId);
      if (q) setQuotationPreview(q);
    }
    if (tab === 'payments' && entityId) {
      const p = state.payments.find((pay) => pay.id === entityId);
      if (p) setReceiptPreview(p);
    }
    if (tab === 'invoices' && entityId) {
      const inv = state.invoices.find((i) => i.id === entityId);
      if (inv) setInvoicePreview(inv);
    }
  };

  // Convert Enquiry actions
  const handleEnquiryConvertToQuotation = (enquiry: Enquiry) => {
    let customer = db.findCustomerByPhone(enquiry.customer_phone);
    if (!customer) {
      customer = db.addCustomer({
        name: enquiry.customer_name,
        phone: enquiry.customer_phone,
        email: enquiry.customer_email,
        notes: `Converted from lead (${enquiry.event_type})`,
      });
    }
    setQuotationToEdit(null);
    setQuotationInitialCustId(customer.id);
    setQuotationInitialTitle(`${enquiry.customer_name} ${enquiry.event_type}`);
    setIsQuotationModalOpen(true);
  };

  const handleEnquiryConvertToBooking = (enquiry: Enquiry) => {
    let customer = db.findCustomerByPhone(enquiry.customer_phone);
    if (!customer) {
      customer = db.addCustomer({
        name: enquiry.customer_name,
        phone: enquiry.customer_phone,
        email: enquiry.customer_email,
        notes: `Converted from lead (${enquiry.event_type})`,
      });
    }
    setBookingToEdit(null);
    setBookingInitialCustId(customer.id);
    setBookingInitialTitle(`${enquiry.customer_name} ${enquiry.event_type}`);
    setBookingInitialBudget(enquiry.estimated_budget);
    setIsBookingModalOpen(true);
  };

  const handleQuotationConvertToBooking = (quotationId: string) => {
    const booking = db.convertQuotationToBooking(quotationId);
    if (booking) {
      setQuotationPreview(null);
      setActiveTab('bookings');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-neutral-50/70 font-sans text-neutral-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openQuickAction={() => setIsQuickActionOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopHeader
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={handleGlobalNavigate}
              onQuickAction={handleSelectQuickAction}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              onSelectCustomer={(c) => setSelectedCustomerDetail(c)}
              onNewCustomer={() => {
                setCustomerToEdit(null);
                setIsCustomerModalOpen(true);
              }}
              onEditCustomer={(c) => {
                setCustomerToEdit(c);
                setIsCustomerModalOpen(true);
              }}
              onNewBookingForCustomer={(c) => {
                setBookingToEdit(null);
                setBookingInitialCustId(c.id);
                setBookingInitialTitle(`${c.name} Wedding & Reception`);
                setIsBookingModalOpen(true);
              }}
            />
          )}

          {activeTab === 'enquiries' && (
            <EnquiriesView
              onNewEnquiry={() => {
                setEnquiryToEdit(null);
                setIsEnquiryModalOpen(true);
              }}
              onEditEnquiry={(enq) => {
                setEnquiryToEdit(enq);
                setIsEnquiryModalOpen(true);
              }}
              onConvertToQuotation={handleEnquiryConvertToQuotation}
              onConvertToBooking={handleEnquiryConvertToBooking}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              onNewQuotation={() => {
                setQuotationToEdit(null);
                setQuotationInitialCustId(undefined);
                setQuotationInitialTitle(undefined);
                setIsQuotationModalOpen(true);
              }}
              onEditQuotation={(q) => {
                setQuotationToEdit(q);
                setIsQuotationModalOpen(true);
              }}
              onPreviewQuotation={(q) => setQuotationPreview(q)}
              onConvertToBooking={handleQuotationConvertToBooking}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsView
              onNewBooking={() => {
                setBookingToEdit(null);
                setBookingInitialCustId(undefined);
                setBookingInitialTitle(undefined);
                setBookingInitialBudget(undefined);
                setIsBookingModalOpen(true);
              }}
              onEditBooking={(b) => {
                setBookingToEdit(b);
                setIsBookingModalOpen(true);
              }}
              onAddEventDay={(bookingId) => {
                setAssignmentInitialEventDayId(undefined);
                setIsTeamAssignmentModalOpen(true);
              }}
              onRecordPaymentForBooking={(bookingId) => {
                setPaymentInitialBookingId(bookingId);
                setIsPaymentModalOpen(true);
              }}
              onAssignCrew={(eventDayId) => {
                setAssignmentInitialEventDayId(eventDayId);
                setIsTeamAssignmentModalOpen(true);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              onSelectEvent={(ev) => {
                setAssignmentInitialEventDayId(ev.id);
                setIsTeamAssignmentModalOpen(true);
              }}
              onAssignCrew={(eventDayId) => {
                setAssignmentInitialEventDayId(eventDayId);
                setIsTeamAssignmentModalOpen(true);
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              onRecordPayment={() => {
                setPaymentInitialBookingId(undefined);
                setIsPaymentModalOpen(true);
              }}
              onPreviewReceipt={(p) => setReceiptPreview(p)}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              onNewInvoice={() => {
                setInvoiceToEdit(null);
                setInvoiceInitialBookingId(undefined);
                setIsInvoiceModalOpen(true);
              }}
              onEditInvoice={(inv) => {
                setInvoiceToEdit(inv);
                setIsInvoiceModalOpen(true);
              }}
              onPreviewInvoice={(inv) => setInvoicePreview(inv)}
            />
          )}

          {activeTab === 'deliverables' && (
            <DeliverablesView
              onNewDeliverable={() => {
                setDeliverableToEdit(null);
                setIsDeliverableModalOpen(true);
              }}
              onEditDeliverable={(d) => {
                setDeliverableToEdit(d);
                setIsDeliverableModalOpen(true);
              }}
              onPreviewReceipt={(d) => setDeliverableReceiptPreview(d)}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              onNewTeamMember={() => {
                setTeamMemberToEdit(null);
                setIsTeamMemberModalOpen(true);
              }}
              onEditTeamMember={(m) => {
                setTeamMemberToEdit(m);
                setIsTeamMemberModalOpen(true);
              }}
              onAssignCrew={(eventDayId) => {
                setAssignmentInitialEventDayId(eventDayId);
                setIsTeamAssignmentModalOpen(true);
              }}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              onNewExpense={() => {
                setExpenseInitialBookingId(undefined);
                setIsExpenseModalOpen(true);
              }}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'services' && <ServicesPackagesView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Print Views */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleGlobalNavigate}
      />

      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setActiveTab('dashboard');
        }}
      />

      {/* Customer Modals */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <CustomerDetailDrawer
        customer={selectedCustomerDetail}
        onClose={() => setSelectedCustomerDetail(null)}
        onEdit={(c) => {
          setCustomerToEdit(c);
          setIsCustomerModalOpen(true);
        }}
        onNewBooking={(c) => {
          setBookingToEdit(null);
          setBookingInitialCustId(c.id);
          setBookingInitialTitle(`${c.name} Wedding`);
          setIsBookingModalOpen(true);
        }}
        onReceivePayment={(c) => {
          const firstBooking = state.bookings.find((b) => b.customer_id === c.id);
          setPaymentInitialBookingId(firstBooking?.id);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        enquiryToEdit={enquiryToEdit}
        onConvertToQuotation={handleEnquiryConvertToQuotation}
        onConvertToBooking={handleEnquiryConvertToBooking}
      />

      {/* Quotation Modals */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        quotationToEdit={quotationToEdit}
        initialCustomerId={quotationInitialCustId}
        initialEventTitle={quotationInitialTitle}
        onPreview={(q) => {
          setIsQuotationModalOpen(false);
          setQuotationPreview(q);
        }}
      />

      <QuotationPrintView
        quotation={quotationPreview}
        onClose={() => setQuotationPreview(null)}
        onConvertToBooking={handleQuotationConvertToBooking}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingToEdit={bookingToEdit}
        initialCustomerId={bookingInitialCustId}
        initialTitle={bookingInitialTitle}
        initialBudget={bookingInitialBudget}
      />

      {/* Payment Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        initialBookingId={paymentInitialBookingId}
        onSuccess={(p) => setReceiptPreview(p)}
      />

      <ReceiptPrintView
        payment={receiptPreview}
        onClose={() => setReceiptPreview(null)}
      />

      {/* Invoice Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceToEdit={invoiceToEdit}
        initialBookingId={invoiceInitialBookingId}
        onPreview={(inv) => {
          setIsInvoiceModalOpen(false);
          setInvoicePreview(inv);
        }}
      />

      <InvoicePrintView
        invoice={invoicePreview}
        onClose={() => setInvoicePreview(null)}
      />

      {/* Team Modals */}
      <TeamMemberModal
        isOpen={isTeamMemberModalOpen}
        onClose={() => setIsTeamMemberModalOpen(false)}
        memberToEdit={teamMemberToEdit}
      />

      <TeamAssignmentModal
        isOpen={isTeamAssignmentModalOpen}
        onClose={() => setIsTeamAssignmentModalOpen(false)}
        initialEventDayId={assignmentInitialEventDayId}
      />

      {/* Deliverable Modals */}
      <DeliverableModal
        isOpen={isDeliverableModalOpen}
        onClose={() => setIsDeliverableModalOpen(false)}
        deliverableToEdit={deliverableToEdit}
        onOpenReceipt={(d) => setDeliverableReceiptPreview(d)}
      />

      <DeliverableReceiptView
        deliverable={deliverableReceiptPreview}
        onClose={() => setDeliverableReceiptPreview(null)}
      />

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        initialBookingId={expenseInitialBookingId}
      />
    </div>
  );
}

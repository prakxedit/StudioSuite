import {
  Organization,
  OrganizationMember,
  OrganizationSettings,
  Customer,
  Enquiry,
  ServiceItem,
  Package,
  Quotation,
  Booking,
  BookingEventDay,
  PaymentSchedule,
  Payment,
  Invoice,
  TeamMember,
  TeamAssignment,
  Deliverable,
  Expense,
  NotificationItem,
  FinancialSummary,
  UserRole,
} from '../../types';
import {
  DEMO_ORG_ID,
  DEMO_USER_ID,
  initialOrganization,
  initialMembers,
  initialSettings,
  initialCustomers,
  initialServices,
  initialPackages,
  initialEnquiries,
  initialQuotations,
  initialBookings,
  initialEventDays,
  initialPaymentSchedules,
  initialPayments,
  initialInvoices,
  initialTeamMembers,
  initialTeamAssignments,
  initialDeliverables,
  initialExpenses,
  initialNotifications,
} from './initialData';

const STORAGE_KEY = 'skysuite_database_v2';

export interface SkySuiteDatabaseState {
  currentOrgId: string;
  currentUserId: string;
  currentUserRole: UserRole;
  organizations: Organization[];
  members: OrganizationMember[];
  settings: OrganizationSettings[];
  customers: Customer[];
  enquiries: Enquiry[];
  services: ServiceItem[];
  packages: Package[];
  quotations: Quotation[];
  bookings: Booking[];
  eventDays: BookingEventDay[];
  paymentSchedules: PaymentSchedule[];
  payments: Payment[];
  invoices: Invoice[];
  teamMembers: TeamMember[];
  teamAssignments: TeamAssignment[];
  deliverables: Deliverable[];
  expenses: Expense[];
  notifications: NotificationItem[];
}

function getInitialState(): SkySuiteDatabaseState {
  return {
    currentOrgId: DEMO_ORG_ID,
    currentUserId: DEMO_USER_ID,
    currentUserRole: 'OWNER',
    organizations: [initialOrganization],
    members: initialMembers,
    settings: [initialSettings],
    customers: initialCustomers,
    enquiries: initialEnquiries,
    services: initialServices,
    packages: initialPackages,
    quotations: initialQuotations,
    bookings: initialBookings,
    eventDays: initialEventDays,
    paymentSchedules: initialPaymentSchedules,
    payments: initialPayments,
    invoices: initialInvoices,
    teamMembers: initialTeamMembers,
    teamAssignments: initialTeamAssignments,
    deliverables: initialDeliverables,
    expenses: initialExpenses,
    notifications: initialNotifications,
  };
}

let memoryState: SkySuiteDatabaseState = (() => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading SkySuite from localStorage:', e);
    }
  }
  return getInitialState();
})();

const listeners: Set<() => void> = new Set();

function persistAndNotify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }
  listeners.forEach((listener) => listener());
}

export const SkySuiteDB = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getState(): SkySuiteDatabaseState {
    return memoryState;
  },

  resetToDemo() {
    memoryState = getInitialState();
    persistAndNotify();
  },

  setCurrentOrg(orgId: string) {
    memoryState.currentOrgId = orgId;
    const member = memoryState.members.find(
      (m) => m.organization_id === orgId && m.user_id === memoryState.currentUserId
    );
    if (member) {
      memoryState.currentUserRole = member.role;
    }
    persistAndNotify();
  },

  setCurrentUserRole(role: UserRole) {
    memoryState.currentUserRole = role;
    persistAndNotify();
  },

  // Organization
  getCurrentOrg(): Organization | undefined {
    return memoryState.organizations.find((o) => o.id === memoryState.currentOrgId);
  },

  getCurrentSettings(): OrganizationSettings {
    const s = memoryState.settings.find((st) => st.organization_id === memoryState.currentOrgId);
    if (s) return s;
    return initialSettings;
  },

  updateOrganization(updated: Partial<Organization>) {
    memoryState.organizations = memoryState.organizations.map((org) => {
      if (org.id === memoryState.currentOrgId) {
        return { ...org, ...updated, updated_at: new Date().toISOString() };
      }
      return org;
    });
    persistAndNotify();
  },

  updateOrgSettings(updated: Partial<OrganizationSettings>) {
    memoryState.settings = memoryState.settings.map((s) => {
      if (s.organization_id === memoryState.currentOrgId) {
        return { ...s, ...updated, updated_at: new Date().toISOString() };
      }
      return s;
    });
    persistAndNotify();
  },

  createOrganization(data: {
    businessName: string;
    ownerName: string;
    phone: string;
    city: string;
    state: string;
    businessType: any;
    services: string[];
  }): Organization {
    const newOrgId = 'org-' + Date.now();
    const newOrg: Organization = {
      id: newOrgId,
      name: data.businessName,
      business_name: data.businessName,
      owner_name: data.ownerName,
      phone: data.phone,
      email: memoryState.currentUserId.includes('@') ? memoryState.currentUserId : 'owner@' + data.businessName.toLowerCase().replace(/\s+/g, '') + '.com',
      address: '',
      city: data.city,
      state: data.state,
      pincode: '',
      invoice_prefix: 'INV-2026-',
      quotation_prefix: 'QT-2026-',
      receipt_prefix: 'REC-2026-',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      business_type: data.businessType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newMember: OrganizationMember = {
      id: 'mem-' + Date.now(),
      organization_id: newOrgId,
      user_id: memoryState.currentUserId,
      user_name: data.ownerName,
      user_email: newOrg.email,
      role: 'OWNER',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newSettings: OrganizationSettings = {
      id: 'set-' + Date.now(),
      organization_id: newOrgId,
      default_tax: 0,
      payment_terms: '1. 25% Advance booking deposit.\n2. Balance due prior to event.',
      quotation_terms: '1. Valid for 15 days from issuance date.',
      bank_name: '',
      account_name: data.businessName,
      account_number: '',
      ifsc_code: '',
      upi_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const initialDefaultServices: ServiceItem[] = data.services.map((srvName, idx) => ({
      id: `srv-${newOrgId}-${idx}`,
      organization_id: newOrgId,
      name: srvName,
      category: srvName.includes('Video') ? 'Videography' : 'Photography',
      default_price: 20000,
      unit: 'per day',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    memoryState.organizations.push(newOrg);
    memoryState.members.push(newMember);
    memoryState.settings.push(newSettings);
    memoryState.services.push(...initialDefaultServices);
    memoryState.currentOrgId = newOrgId;
    memoryState.currentUserRole = 'OWNER';

    persistAndNotify();
    return newOrg;
  },

  // Financial Calculations from source transactions
  getFinancialSummary(): FinancialSummary {
    const orgId = memoryState.currentOrgId;
    const orgBookings = memoryState.bookings.filter((b) => b.organization_id === orgId);
    const orgPayments = memoryState.payments.filter((p) => p.organization_id === orgId);
    const orgExpenses = memoryState.expenses.filter((e) => e.organization_id === orgId);
    const orgDeliverables = memoryState.deliverables.filter((d) => d.organization_id === orgId);
    const orgEvents = memoryState.eventDays.filter((e) => e.organization_id === orgId);
    const orgEnquiries = memoryState.enquiries.filter(
      (enq) => enq.organization_id === orgId && enq.status !== 'BOOKED' && enq.status !== 'LOST'
    );

    const totalRevenue = orgBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const totalReceived = orgPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutstanding = Math.max(0, totalRevenue - totalReceived);
    const totalExpenses = orgExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const estimatedProfit = totalReceived - totalExpenses;

    const pendingDeliveries = orgDeliverables.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length;
    const activeBookings = orgBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'ONGOING').length;

    // Upcoming events: event_date >= today
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEventsCount = orgEvents.filter(
      (ev) => ev.event_date >= todayStr && ev.status !== 'CANCELLED'
    ).length;

    return {
      totalRevenue,
      totalReceived,
      totalOutstanding,
      totalExpenses,
      estimatedProfit,
      totalBookings: orgBookings.length,
      activeBookings,
      pendingDeliveries,
      upcomingEventsCount,
      openEnquiriesCount: orgEnquiries.length,
    };
  },

  getBookingFinancials(bookingId: string) {
    const booking = memoryState.bookings.find((b) => b.id === bookingId);
    const total = booking?.total_amount || 0;
    const bookingPayments = memoryState.payments.filter((p) => p.booking_id === bookingId);
    const received = bookingPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = Math.max(0, total - received);
    const bookingExpenses = memoryState.expenses
      .filter((e) => e.booking_id === bookingId)
      .reduce((sum, e) => sum + e.amount, 0);
    const profit = received - bookingExpenses;

    return {
      total,
      received,
      outstanding,
      expenses: bookingExpenses,
      profit,
    };
  },

  getCustomerFinancials(customerId: string) {
    const custBookings = memoryState.bookings.filter((b) => b.customer_id === customerId);
    const custPayments = memoryState.payments.filter((p) => p.customer_id === customerId);

    const totalValue = custBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const totalReceived = custPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstanding = Math.max(0, totalValue - totalReceived);

    return {
      bookingCount: custBookings.length,
      totalValue,
      totalReceived,
      outstanding,
    };
  },

  // Conflict detection for team members
  checkTeamConflict(
    teamMemberId: string,
    eventDate: string,
    startTime: string,
    endTime: string,
    excludeAssignmentId?: string
  ): { hasConflict: boolean; conflictingEvent?: BookingEventDay; conflictingAssignment?: TeamAssignment } {
    const orgId = memoryState.currentOrgId;
    const assignments = memoryState.teamAssignments.filter(
      (a) => a.organization_id === orgId && a.team_member_id === teamMemberId && a.id !== excludeAssignmentId
    );

    for (const a of assignments) {
      const eventDay = memoryState.eventDays.find((ed) => ed.id === a.event_day_id);
      if (eventDay && eventDay.event_date === eventDate && eventDay.status !== 'CANCELLED') {
        // Time overlap check: start1 < end2 && start2 < end1
        const aStart = a.start_time || eventDay.start_time;
        const aEnd = a.end_time || eventDay.end_time;
        if (startTime < aEnd && aStart < endTime) {
          return {
            hasConflict: true,
            conflictingEvent: eventDay,
            conflictingAssignment: a,
          };
        }
      }
    }

    return { hasConflict: false };
  },

  // Auto-numbering generators
  generateQuotationNumber(): string {
    const org = this.getCurrentOrg();
    const prefix = org?.quotation_prefix || 'QT-2026-';
    const orgQuotations = memoryState.quotations.filter((q) => q.organization_id === memoryState.currentOrgId);
    const nextNum = orgQuotations.length + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  },

  generateReceiptNumber(): string {
    const org = this.getCurrentOrg();
    const prefix = org?.receipt_prefix || 'REC-2026-';
    const orgPayments = memoryState.payments.filter((p) => p.organization_id === memoryState.currentOrgId);
    const nextNum = orgPayments.length + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  },

  generateInvoiceNumber(): string {
    const org = this.getCurrentOrg();
    const prefix = org?.invoice_prefix || 'INV-2026-';
    const orgInvoices = memoryState.invoices.filter((i) => i.organization_id === memoryState.currentOrgId);
    const nextNum = orgInvoices.length + 1;
    return `${prefix}${String(nextNum).padStart(4, '0')}`;
  },

  generateBookingNumber(): string {
    const orgBookings = memoryState.bookings.filter((b) => b.organization_id === memoryState.currentOrgId);
    const nextNum = orgBookings.length + 1;
    return `BK-2026-${String(nextNum).padStart(4, '0')}`;
  },

  // Customers CRUD
  getCustomers(): Customer[] {
    return memoryState.customers.filter((c) => c.organization_id === memoryState.currentOrgId);
  },

  findCustomerByPhone(phone: string): Customer | undefined {
    const clean = phone.replace(/[^\d]/g, '');
    return memoryState.customers.find(
      (c) => c.organization_id === memoryState.currentOrgId && c.phone.replace(/[^\d]/g, '') === clean
    );
  },

  addCustomer(customer: Omit<Customer, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: 'cust-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.customers.unshift(newCustomer);
    persistAndNotify();
    return newCustomer;
  },

  updateCustomer(id: string, updates: Partial<Customer>) {
    memoryState.customers = memoryState.customers.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    );
    persistAndNotify();
  },

  deleteCustomer(id: string) {
    memoryState.customers = memoryState.customers.filter((c) => c.id !== id);
    persistAndNotify();
  },

  // Enquiries CRUD
  getEnquiries(): Enquiry[] {
    return memoryState.enquiries.filter((e) => e.organization_id === memoryState.currentOrgId);
  },

  addEnquiry(enquiry: Omit<Enquiry, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Enquiry {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: 'enq-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.enquiries.unshift(newEnquiry);
    persistAndNotify();
    return newEnquiry;
  },

  updateEnquiry(id: string, updates: Partial<Enquiry>) {
    memoryState.enquiries = memoryState.enquiries.map((e) =>
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
    );
    persistAndNotify();
  },

  deleteEnquiry(id: string) {
    memoryState.enquiries = memoryState.enquiries.filter((e) => e.id !== id);
    persistAndNotify();
  },

  convertEnquiryToCustomer(enquiryId: string): Customer | undefined {
    const enq = memoryState.enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    let customer = this.findCustomerByPhone(enq.customer_phone);
    if (!customer) {
      customer = this.addCustomer({
        name: enq.customer_name,
        phone: enq.customer_phone,
        email: enq.customer_email,
        notes: `Converted from lead (${enq.event_type} on ${enq.event_date || 'TBD'})`,
      });
    }

    this.updateEnquiry(enquiryId, {
      customer_id: customer.id,
      status: 'CONTACTED',
    });

    return customer;
  },

  // Services & Packages CRUD
  getServices(): ServiceItem[] {
    return memoryState.services.filter((s) => s.organization_id === memoryState.currentOrgId);
  },

  addService(service: Omit<ServiceItem, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): ServiceItem {
    const newService: ServiceItem = {
      ...service,
      id: 'srv-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.services.push(newService);
    persistAndNotify();
    return newService;
  },

  updateService(id: string, updates: Partial<ServiceItem>) {
    memoryState.services = memoryState.services.map((s) =>
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    );
    persistAndNotify();
  },

  deleteService(id: string) {
    memoryState.services = memoryState.services.filter((s) => s.id !== id);
    persistAndNotify();
  },

  getPackages(): Package[] {
    return memoryState.packages.filter((p) => p.organization_id === memoryState.currentOrgId);
  },

  addPackage(pkg: Omit<Package, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Package {
    const newPkg: Package = {
      ...pkg,
      id: 'pkg-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.packages.push(newPkg);
    persistAndNotify();
    return newPkg;
  },

  updatePackage(id: string, updates: Partial<Package>) {
    memoryState.packages = memoryState.packages.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    persistAndNotify();
  },

  deletePackage(id: string) {
    memoryState.packages = memoryState.packages.filter((p) => p.id !== id);
    persistAndNotify();
  },

  // Quotations CRUD
  getQuotations(): Quotation[] {
    return memoryState.quotations.filter((q) => q.organization_id === memoryState.currentOrgId);
  },

  addQuotation(quotation: Omit<Quotation, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Quotation {
    const newQuotation: Quotation = {
      ...quotation,
      id: 'qt-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.quotations.unshift(newQuotation);
    persistAndNotify();
    return newQuotation;
  },

  updateQuotation(id: string, updates: Partial<Quotation>) {
    memoryState.quotations = memoryState.quotations.map((q) =>
      q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q
    );
    persistAndNotify();
  },

  deleteQuotation(id: string) {
    memoryState.quotations = memoryState.quotations.filter((q) => q.id !== id);
    persistAndNotify();
  },

  convertQuotationToBooking(quotationId: string): Booking | undefined {
    const quotation = memoryState.quotations.find((q) => q.id === quotationId);
    if (!quotation) return;

    const bookingNumber = this.generateBookingNumber();
    const newBooking: Booking = {
      id: 'bk-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      booking_number: bookingNumber,
      title: quotation.event_title || `${quotation.customer_name} Booking`,
      customer_id: quotation.customer_id,
      customer_name: quotation.customer_name,
      customer_phone: quotation.customer_phone,
      quotation_id: quotation.id,
      total_amount: quotation.total,
      status: 'CONFIRMED',
      notes: `Converted from Quotation ${quotation.quotation_number}.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryState.bookings.unshift(newBooking);

    // Create 3 standard payment milestones: Advance 25%, Pre-Event 50%, Delivery 25%
    const adv = Math.round(quotation.total * 0.25);
    const mid = Math.round(quotation.total * 0.5);
    const bal = quotation.total - adv - mid;

    const todayStr = new Date().toISOString().split('T')[0];
    this.addPaymentSchedule({
      booking_id: newBooking.id,
      title: 'Advance Token (25%)',
      amount: adv,
      due_date: todayStr,
      status: 'PENDING',
      notes: 'Due to secure booking confirmation',
    });

    this.addPaymentSchedule({
      booking_id: newBooking.id,
      title: 'Pre-Event Installment (50%)',
      amount: mid,
      due_date: quotation.valid_until || todayStr,
      status: 'PENDING',
      notes: 'Due 7 days prior to event',
    });

    this.addPaymentSchedule({
      booking_id: newBooking.id,
      title: 'Final Handover (25%)',
      amount: bal,
      due_date: quotation.valid_until || todayStr,
      status: 'PENDING',
      notes: 'Due upon deliverable soft proofing',
    });

    this.updateQuotation(quotationId, {
      status: 'ACCEPTED',
      converted_booking_id: newBooking.id,
    });

    persistAndNotify();
    return newBooking;
  },

  // Bookings CRUD
  getBookings(): Booking[] {
    return memoryState.bookings.filter((b) => b.organization_id === memoryState.currentOrgId);
  },

  addBooking(booking: Omit<Booking, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: 'bk-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.bookings.unshift(newBooking);
    persistAndNotify();
    return newBooking;
  },

  updateBooking(id: string, updates: Partial<Booking>) {
    memoryState.bookings = memoryState.bookings.map((b) =>
      b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
    );
    persistAndNotify();
  },

  deleteBooking(id: string) {
    memoryState.bookings = memoryState.bookings.filter((b) => b.id !== id);
    persistAndNotify();
  },

  // Event Days CRUD
  getEventDays(): BookingEventDay[] {
    return memoryState.eventDays.filter((e) => e.organization_id === memoryState.currentOrgId);
  },

  getBookingEventDays(bookingId: string): BookingEventDay[] {
    return memoryState.eventDays.filter(
      (e) => e.organization_id === memoryState.currentOrgId && e.booking_id === bookingId
    );
  },

  addEventDay(eventDay: Omit<BookingEventDay, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): BookingEventDay {
    const newEvent: BookingEventDay = {
      ...eventDay,
      id: 'evd-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.eventDays.push(newEvent);
    persistAndNotify();
    return newEvent;
  },

  updateEventDay(id: string, updates: Partial<BookingEventDay>) {
    memoryState.eventDays = memoryState.eventDays.map((e) =>
      e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
    );
    persistAndNotify();
  },

  deleteEventDay(id: string) {
    memoryState.eventDays = memoryState.eventDays.filter((e) => e.id !== id);
    memoryState.teamAssignments = memoryState.teamAssignments.filter((a) => a.event_day_id !== id);
    persistAndNotify();
  },

  // Payment Schedules & Payments CRUD
  getPaymentSchedules(bookingId?: string): PaymentSchedule[] {
    const orgId = memoryState.currentOrgId;
    if (bookingId) {
      return memoryState.paymentSchedules.filter((s) => s.organization_id === orgId && s.booking_id === bookingId);
    }
    return memoryState.paymentSchedules.filter((s) => s.organization_id === orgId);
  },

  addPaymentSchedule(schedule: Omit<PaymentSchedule, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): PaymentSchedule {
    const newSchedule: PaymentSchedule = {
      ...schedule,
      id: 'sch-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.paymentSchedules.push(newSchedule);
    persistAndNotify();
    return newSchedule;
  },

  updatePaymentSchedule(id: string, updates: Partial<PaymentSchedule>) {
    memoryState.paymentSchedules = memoryState.paymentSchedules.map((s) =>
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    );
    persistAndNotify();
  },

  deletePaymentSchedule(id: string) {
    memoryState.paymentSchedules = memoryState.paymentSchedules.filter((s) => s.id !== id);
    persistAndNotify();
  },

  getPayments(bookingId?: string): Payment[] {
    const orgId = memoryState.currentOrgId;
    if (bookingId) {
      return memoryState.payments.filter((p) => p.organization_id === orgId && p.booking_id === bookingId);
    }
    return memoryState.payments.filter((p) => p.organization_id === orgId);
  },

  addPayment(data: {
    booking_id: string;
    customer_id: string;
    payment_schedule_id?: string;
    amount: number;
    payment_date: string;
    payment_method: any;
    reference_number?: string;
    notes?: string;
  }): Payment {
    const booking = memoryState.bookings.find((b) => b.id === data.booking_id);
    const customer = memoryState.customers.find((c) => c.id === data.customer_id);
    const receiptNumber = this.generateReceiptNumber();

    const newPayment: Payment = {
      ...data,
      id: 'pay-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      receipt_number: receiptNumber,
      booking_title: booking?.title,
      customer_name: customer?.name || booking?.customer_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryState.payments.unshift(newPayment);

    // If linked to payment schedule, update schedule status
    if (data.payment_schedule_id) {
      const schedule = memoryState.paymentSchedules.find((s) => s.id === data.payment_schedule_id);
      if (schedule) {
        if (data.amount >= schedule.amount) {
          schedule.status = 'PAID';
        } else {
          schedule.status = 'PARTIAL';
        }
        schedule.updated_at = new Date().toISOString();
      }
    }

    // Add a notification
    memoryState.notifications.unshift({
      id: 'notif-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      title: `Payment Received: ₹${data.amount.toLocaleString('en-IN')}`,
      message: `Received via ${data.payment_method} for ${booking?.title || 'Booking'} (${receiptNumber}).`,
      type: 'PAYMENT',
      read: false,
      entity_type: 'payment',
      entity_id: newPayment.id,
      created_at: new Date().toISOString(),
    });

    persistAndNotify();
    return newPayment;
  },

  // Invoices CRUD
  getInvoices(): Invoice[] {
    return memoryState.invoices.filter((i) => i.organization_id === memoryState.currentOrgId);
  },

  addInvoice(invoice: Omit<Invoice, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Invoice {
    const newInvoice: Invoice = {
      ...invoice,
      id: 'inv-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.invoices.unshift(newInvoice);
    persistAndNotify();
    return newInvoice;
  },

  updateInvoice(id: string, updates: Partial<Invoice>) {
    memoryState.invoices = memoryState.invoices.map((i) =>
      i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i
    );
    persistAndNotify();
  },

  deleteInvoice(id: string) {
    memoryState.invoices = memoryState.invoices.filter((i) => i.id !== id);
    persistAndNotify();
  },

  // Team & Assignments CRUD
  getTeamMembers(): TeamMember[] {
    return memoryState.teamMembers.filter((m) => m.organization_id === memoryState.currentOrgId);
  },

  addTeamMember(member: Omit<TeamMember, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): TeamMember {
    const newMember: TeamMember = {
      ...member,
      id: 'tm-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.teamMembers.push(newMember);
    persistAndNotify();
    return newMember;
  },

  updateTeamMember(id: string, updates: Partial<TeamMember>) {
    memoryState.teamMembers = memoryState.teamMembers.map((m) =>
      m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
    );
    persistAndNotify();
  },

  deleteTeamMember(id: string) {
    memoryState.teamMembers = memoryState.teamMembers.filter((m) => m.id !== id);
    persistAndNotify();
  },

  getTeamAssignments(eventDayId?: string): TeamAssignment[] {
    const orgId = memoryState.currentOrgId;
    if (eventDayId) {
      return memoryState.teamAssignments.filter((a) => a.organization_id === orgId && a.event_day_id === eventDayId);
    }
    return memoryState.teamAssignments.filter((a) => a.organization_id === orgId);
  },

  assignTeamMember(data: {
    event_day_id: string;
    team_member_id: string;
    role: string;
    start_time: string;
    end_time: string;
    rate: number;
    notes?: string;
  }): TeamAssignment {
    const member = memoryState.teamMembers.find((m) => m.id === data.team_member_id);
    const newAssignment: TeamAssignment = {
      ...data,
      id: 'asn-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      team_member_name: member?.name || 'Staff',
      payment_status: 'UNPAID',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.teamAssignments.push(newAssignment);
    persistAndNotify();
    return newAssignment;
  },

  deleteTeamAssignment(id: string) {
    memoryState.teamAssignments = memoryState.teamAssignments.filter((a) => a.id !== id);
    persistAndNotify();
  },

  // Deliverables CRUD
  getDeliverables(): Deliverable[] {
    return memoryState.deliverables.filter((d) => d.organization_id === memoryState.currentOrgId);
  },

  addDeliverable(deliverable: Omit<Deliverable, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Deliverable {
    const newDel: Deliverable = {
      ...deliverable,
      id: 'del-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.deliverables.push(newDel);
    persistAndNotify();
    return newDel;
  },

  updateDeliverable(id: string, updates: Partial<Deliverable>) {
    memoryState.deliverables = memoryState.deliverables.map((d) =>
      d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
    );
    persistAndNotify();
  },

  deleteDeliverable(id: string) {
    memoryState.deliverables = memoryState.deliverables.filter((d) => d.id !== id);
    persistAndNotify();
  },

  // Expenses CRUD
  getExpenses(): Expense[] {
    return memoryState.expenses.filter((e) => e.organization_id === memoryState.currentOrgId);
  },

  addExpense(expense: Omit<Expense, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Expense {
    const newExp: Expense = {
      ...expense,
      id: 'exp-' + Date.now(),
      organization_id: memoryState.currentOrgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryState.expenses.unshift(newExp);
    persistAndNotify();
    return newExp;
  },

  deleteExpense(id: string) {
    memoryState.expenses = memoryState.expenses.filter((e) => e.id !== id);
    persistAndNotify();
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return memoryState.notifications.filter((n) => n.organization_id === memoryState.currentOrgId);
  },

  markNotificationRead(id: string) {
    memoryState.notifications = memoryState.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    persistAndNotify();
  },

  markAllNotificationsRead() {
    memoryState.notifications = memoryState.notifications.map((n) =>
      n.organization_id === memoryState.currentOrgId ? { ...n, read: true } : n
    );
    persistAndNotify();
  },
};

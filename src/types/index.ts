export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type BusinessType =
  | 'Photography Studio'
  | 'Photographer'
  | 'Videographer'
  | 'Creative Studio'
  | 'Photo/Colour Lab'
  | 'Other';

export type LeadSource =
  | 'WhatsApp'
  | 'Instagram'
  | 'Facebook'
  | 'Website'
  | 'Google'
  | 'Referral'
  | 'Walk-in'
  | 'Phone'
  | 'Other';

export type EnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUOTATION_SENT'
  | 'FOLLOW_UP'
  | 'NEGOTIATION'
  | 'BOOKED'
  | 'LOST';

export type LostReason =
  | 'Price Too High'
  | 'Date Unavailable'
  | 'Chose Another Photographer'
  | 'No Response'
  | 'Other';

export type EventType =
  | 'Wedding'
  | 'Pre-Wedding'
  | 'Engagement'
  | 'Reception'
  | 'Mehendi'
  | 'Haldi'
  | 'Birthday'
  | 'Maternity'
  | 'Baby Shoot'
  | 'Corporate'
  | 'Product Shoot'
  | 'Other';

export type BookingStatus =
  | 'TENTATIVE'
  | 'CONFIRMED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type EventDayStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'UPI'
  | 'BANK_TRANSFER'
  | 'CARD'
  | 'CHEQUE'
  | 'OTHER';

export type PaymentScheduleStatus =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';

export type TeamCategory =
  | 'PHOTOGRAPHER'
  | 'VIDEOGRAPHER'
  | 'CINEMATOGRAPHER'
  | 'DRONE_OPERATOR'
  | 'EDITOR'
  | 'ALBUM_DESIGNER'
  | 'ASSISTANT'
  | 'DRIVER'
  | 'OTHER';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'FREELANCE'
  | 'CONTRACT';

export type DeliverableStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export type ExpenseCategory =
  | 'Staff'
  | 'Travel'
  | 'Album'
  | 'Printing'
  | 'Equipment'
  | 'Food'
  | 'Fuel'
  | 'Other';

// Organization models
export interface Organization {
  id: string;
  name: string;
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  logo_url?: string;
  gst_number?: string;
  invoice_prefix: string;
  quotation_prefix: string;
  receipt_prefix: string;
  currency: string;
  timezone: string;
  business_type?: BusinessType;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  id: string;
  organization_id: string;
  default_tax: number; // percentage e.g. 18 for GST or 0
  payment_terms: string;
  quotation_terms: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  created_at: string;
  updated_at: string;
}

// Customers
export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Enquiries
export interface Enquiry {
  id: string;
  organization_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  event_type: EventType;
  event_date?: string;
  venue?: string;
  estimated_budget?: number;
  lead_source: LeadSource;
  notes?: string;
  next_followup_date?: string;
  status: EnquiryStatus;
  lost_reason?: LostReason;
  converted_booking_id?: string;
  converted_quotation_id?: string;
  created_at: string;
  updated_at: string;
}

// Services and Packages
export interface ServiceItem {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  default_price: number;
  unit: string; // "per day", "per event", "per unit", etc.
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  package_id: string;
  service_id?: string;
  service_name: string;
  quantity: number;
  price: number;
  description?: string;
}

export interface Package {
  id: string;
  organization_id: string;
  name: string;
  price: number;
  description?: string;
  items: PackageItem[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Quotations
export interface QuotationItem {
  id: string;
  quotation_id: string;
  service_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Quotation {
  id: string;
  organization_id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  event_title: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  status: QuotationStatus;
  items: QuotationItem[];
  converted_booking_id?: string;
  created_at: string;
  updated_at: string;
}

// Bookings & Event Days
export interface Booking {
  id: string;
  organization_id: string;
  booking_number: string;
  title: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  quotation_id?: string;
  total_amount: number;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingEventDay {
  id: string;
  organization_id: string;
  booking_id: string;
  booking_title?: string;
  customer_name?: string;
  customer_phone?: string;
  event_name: string;
  event_type: EventType;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  venue_address?: string;
  status: EventDayStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Payment Schedule & Payments
export interface PaymentSchedule {
  id: string;
  organization_id: string;
  booking_id: string;
  title: string; // e.g. "Advance", "Before Event", "Final Delivery"
  amount: number;
  due_date: string;
  status: PaymentScheduleStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  booking_id: string;
  customer_id: string;
  customer_name?: string;
  booking_title?: string;
  payment_schedule_id?: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Invoices
export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  customer_id: string;
  customer_name: string;
  booking_id: string;
  booking_title: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Team & Assignments
export interface TeamMember {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  email?: string;
  category: TeamCategory;
  role: string;
  daily_rate: number;
  employment_type: EmploymentType;
  active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamAssignment {
  id: string;
  organization_id: string;
  event_day_id: string;
  team_member_id: string;
  team_member_name?: string;
  role: string;
  start_time: string;
  end_time: string;
  rate: number;
  payment_status: 'UNPAID' | 'PAID';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Deliverables
export interface Deliverable {
  id: string;
  organization_id: string;
  booking_id: string;
  booking_title?: string;
  customer_name?: string;
  customer_phone?: string;
  event_day_id?: string;
  name: string; // e.g. "12x36 Album", "Wedding Film", "2 Frames"
  category: string;
  quantity: number;
  due_date: string;
  status: DeliverableStatus;
  assigned_to?: string; // team member name or id
  started_at?: string;
  ready_at?: string;
  delivered_at?: string;
  delivered_to?: string;
  delivery_notes?: string;
  created_at: string;
  updated_at: string;
}

// Expenses
export interface Expense {
  id: string;
  organization_id: string;
  booking_id?: string;
  booking_title?: string;
  event_day_id?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
}

// Notifications
export interface NotificationItem {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  type: 'EVENT' | 'PAYMENT' | 'DELIVERY' | 'FOLLOWUP' | 'CONFLICT';
  read: boolean;
  entity_type: 'booking' | 'event_day' | 'payment' | 'deliverable' | 'enquiry' | 'team';
  entity_id: string;
  created_at: string;
}

// Financial summary calculations
export interface FinancialSummary {
  totalRevenue: number;
  totalReceived: number;
  totalOutstanding: number;
  totalExpenses: number;
  estimatedProfit: number;
  totalBookings: number;
  activeBookings: number;
  pendingDeliveries: number;
  upcomingEventsCount: number;
  openEnquiriesCount: number;
}

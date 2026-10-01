# SKYSUITE
> *"Everything Your Studio Needs, In One Suite."*

Production Business Management Software designed specifically for Indian and global photography studios, candid wedding photographers, cinematographers, drone pilots, and creative production houses.

---

## 1. Executive Overview

SkySuite provides an end-to-end studio operating system covering:
- **Client & CRM**: Lead capture from Instagram, WhatsApp, Facebook, referral, and walk-in pipelines.
- **Rate Cards & Packages**: Bundled offerings (e.g. Gold Wedding Package ₹75,000, Platinum Royal Wedding ₹1,50,000).
- **Quotation Engine**: Real-time itemized proposals with snapshot pricing, taxes (GST), and instant printable PDF output.
- **Commercial Bookings & Operations**: Strict separation between the commercial contract and individual event shoot days (Mehendi, Haldi, Muhurtham, Reception).
- **Payment Milestones & Collections**: Advance token, pre-event, and final delivery installments in Cash, UPI, NEFT Bank Transfer, Card, or Cheque with instant printable receipts (`REC-2026-0001`).
- **Commercial Tax Invoices**: Optional GST billing (`INV-2026-0001`).
- **Crew Roster & Conflict Detection**: Intelligent schedule conflict warnings preventing double-booking of lead photographers or drone operators during overlapping call times.
- **Deliverables Fulfillment**: Fine-art album proofing, 4K wedding films, frames, and wooden pendrives with Delivery Acknowledgment Receipts.
- **Expenses & Net Profit**: Per-booking and overall studio profitability analysis (`Revenue - Expenses = Profit`).

---

## 2. Technology Stack & Multi-Tenant Architecture

- **Frontend**: React 19 / TypeScript / Vite / Tailwind CSS
- **Database & Auth**: PostgreSQL / Supabase
- **Multi-Tenancy**: Every business record is isolated by `organization_id` using PostgreSQL Row Level Security (RLS) policies.
- **Deployment**: Vercel & Node.js

---

## 3. Database Setup & PostgreSQL Migrations

1. Log into your [Supabase Dashboard](https://supabase.com).
2. Create a new PostgreSQL project.
3. Open the **SQL Editor** in the Supabase Dashboard.
4. Open the migration file included in this repository:
   ```
   supabase/migrations/20260101000000_skysuite_init.sql
   ```
5. Paste and run the entire script. This script automatically provisions:
   - UUID extensions
   - 22+ normalized tables (`organizations`, `organization_members`, `organization_settings`, `customers`, `enquiries`, `services`, `packages`, `quotations`, `bookings`, `booking_event_days`, `payment_schedules`, `payments`, `invoices`, `team_members`, `team_assignments`, `deliverables`, `expenses`, `notifications`)
   - `updated_at` auto-updating triggers
   - Unique constraints on quotation numbers, invoice numbers, and receipt numbers per organization
   - Complete Row Level Security (RLS) policies guaranteeing multi-tenant isolation.

---

## 4. Environment Variables Configuration

Copy `.env.example` to your environment:

```bash
# Vite (Local & Dev)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Next.js / Vercel (Production)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

*Note: SkySuite runs seamlessly with its built-in local reactive database preloaded with realistic demo data (Sky Photography Studio, Rahul Sharma Wedding ₹1,25,000, 4 event days, UPI/Cash payments, crew, and deliverables).*

---

## 5. Local Development Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 6. Vercel Deployment Instructions

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your SkySuite GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
5. Click **Deploy**. Vercel will run `npm run build` and output the production bundle.
6. Optional Custom Domain: In Vercel Project Settings → Domains, bind your studio domain (e.g. `suite.yourstudio.com`).

---

## 7. Production Checklist & Verification

- [x] Multi-tenant isolation verified with `organization_id` foreign keys and RLS.
- [x] Duplicate phone number detection warning on customer creation.
- [x] Snapshot pricing stored in quotations (changes to base package prices will not mutate historical quotations).
- [x] Real-time calculations: Total Revenue, Received, Outstanding, and Net Profit.
- [x] Automatic sequential numbering: `QT-2026-0001`, `REC-2026-0001`, `INV-2026-0001`.
- [x] Intelligent crew assignment conflict detection with "Cancel / Assign Anyway" options.
- [x] Printable PDF views for Quotations, Invoices, Payment Receipts, and Delivery Acknowledgments.
- [x] Click-to-chat WhatsApp deep links (`https://wa.me/91...`) formatted for Indian phone numbers.
- [x] Responsive layout with collapsible sidebar and mobile drawer.

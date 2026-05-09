
# Client Lead Management System (Mini CRM)

A clean, modern SaaS-style web app with a public landing page that captures leads through a contact form, plus a secure admin dashboard for managing those leads.

## Pages / Routes

- `/` — Public landing page with hero + embedded contact form (name, email, phone, message, source). Submitting creates a lead with status `new`.
- `/login` — Admin email/password login.
- `/admin` — Admin dashboard (protected). Lead list with filters by status, search by name/email, and stats (total / new / contacted / converted).
- `/admin/leads/$id` — Lead detail view: edit status, view info, add/view follow-up notes timeline.

## Key Features

- Public contact form → creates a lead in the database.
- Admin auth (email/password) — only admin role can access dashboard.
- Lead listing: name, email, phone, source, status, created date.
- Status updates: `new` → `contacted` → `converted` (also `lost`).
- Notes / follow-ups per lead with timestamp + author.
- Dashboard stats cards.
- Form validation (Zod) on both client and server.

## Tech Stack

- TanStack Start + React + Tailwind + shadcn/ui (clean light SaaS theme).
- Lovable Cloud for database, auth, and server functions.

## Database Schema (Lovable Cloud)

- `leads`: id, name, email, phone, source, status (enum: new/contacted/converted/lost), created_at, updated_at.
- `lead_notes`: id, lead_id (FK), author_id (FK auth.users), body, created_at.
- `profiles`: id (FK auth.users), email, full_name.
- `user_roles`: id, user_id, role (enum: admin, user) — separate roles table with `has_role()` security definer function (prevents privilege escalation).

## RLS Policies

- `leads`: anyone (anon) can INSERT (for the public form); only admins can SELECT/UPDATE/DELETE.
- `lead_notes`: only admins can SELECT/INSERT.
- `user_roles`: only admins can manage; users can read their own roles.

## Admin Bootstrap

After signup, the first user must be granted the `admin` role manually via the Cloud database UI (one-time SQL insert). The login page will note this.

## Design

Clean modern SaaS — light theme, neutral grays with a single accent color (indigo/blue), generous whitespace, card-based dashboard, subtle shadows, rounded corners. Uses semantic design tokens defined in `src/styles.css` (oklch).

## Out of Scope (can add later)

- Email notifications on new leads
- CSV export
- Lead assignment to multiple agents
- Activity log beyond notes

# Sama Keur – Institutional Trust Engine

Phase 1 production-grade Next.js 15 + Supabase app for rental trust workflows in Senegal.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS (institutional design system)
- Supabase Auth + Postgres + Storage + RLS
- Vercel deployment

## Core Features
- Owner console (`/owner/*`): worker seat management, vault/property views, approval gate.
- Worker mobile tool (`/worker/*`): intake wizard, KYC + check-in video, payment ledger.
- Guest portal (`/guest/*`): code + phone verification, approval-gated AI chat, signature screen.
- Approval Gate: lease defaults `pending_approval`; owner can only approve after check-in video exists and owner marks review (`checkin_reviewed_at`).
- Worker seat limit enforced both UI and DB trigger (`WORKER_LIMIT_REACHED`).

## Local setup
1. Install deps:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=... # server-only, optional admin tasks
   OPENAI_API_KEY=... # optional
   ```
3. Run app:
   ```bash
   npm run dev
   ```

## Supabase setup
1. Create Supabase project.
2. Run SQL migration in `supabase/migrations/20260214195000_init.sql` (CLI or SQL editor).
3. Create private buckets:
   - `private-kyc`
   - `audit-logs`
4. Keep both buckets private and serve assets using signed URLs only.
5. Optional seed: run `supabase/seed.sql` and replace UUIDs with real auth user ids.

## Storage path convention
Use partitioned paths:
- `private-kyc/{owner_id}/{property_id}/{lease_id}/id-card.jpg`
- `audit-logs/{owner_id}/{property_id}/{lease_id}/checkin.webm`
- `audit-logs/{owner_id}/{property_id}/{lease_id}/receipt.jpg`

## Security model
- RLS enabled on all domain tables.
- Owners: full access to owned properties and nested resources.
- Workers: limited to assigned properties via `worker_access`.
- Workers append-only for payments/media and insert-only for leases.
- AI logs restricted to active leases and authenticated owner/worker contexts.
- Guest AI access validated through code+phone and active lease cookie gate on server endpoints.
- No service-role key usage in client.

## Vercel deploy
1. Push repo to GitHub.
2. Import in Vercel.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (optional)
4. Deploy.


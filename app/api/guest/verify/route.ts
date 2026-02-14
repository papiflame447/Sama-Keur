import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()
  const { data: lease } = await supabase
    .from('leases')
    .select('id,status')
    .eq('check_in_code', body.code)
    .eq('tenant_phone', body.phone)
    .maybeSingle()

  if (!lease) return NextResponse.json({ ok: false, message: 'Lease not found' }, { status: 404 })
  if (lease.status !== 'active') return NextResponse.json({ ok: false, message: 'Not approved yet. Contact your host/worker.' }, { status: 403 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('guest_lease_id', lease.id, { httpOnly: true, sameSite: 'lax', path: '/' })
  return res
}

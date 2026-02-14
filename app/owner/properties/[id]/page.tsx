import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: property }, { data: leases }, { data: payments }, { data: aiLogs }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', id).single(),
    supabase.from('leases').select('*').eq('property_id', id).order('created_at', { ascending: false }),
    supabase.from('payments').select('*,leases!inner(property_id)').eq('leases.property_id', id).order('created_at', { ascending: false }),
    supabase.from('ai_logs').select('*,leases!inner(property_id)').eq('leases.property_id', id).order('created_at', { ascending: false }).limit(30)
  ])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{property?.address}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4"><h2 className="font-semibold mb-2">Financials</h2>{payments?.map((p) => <p key={p.id} className="text-sm">{p.method} · {p.amount}</p>)}</div>
        <div className="card p-4"><h2 className="font-semibold mb-2">AI Oversight</h2>{aiLogs?.map((l) => <p key={l.id} className="text-sm">{l.role}: {l.content}</p>)}</div>
      </div>
      <div className="card p-4"><h2 className="font-semibold mb-2">Leases</h2>{leases?.map((l) => <Link className="block text-sm underline" key={l.id} href={`/owner/leases/${l.id}`}>{l.tenant_full_name} · {l.status}</Link>)}</div>
    </div>
  )
}

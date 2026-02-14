import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function OwnerDashboard() {
  const supabase = await createClient()
  const [{ data: properties }, { data: pending }] = await Promise.all([
    supabase.from('properties').select('id,address'),
    supabase.from('leases').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval')
  ])
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4"><p className="text-sm text-slate-500">Properties</p><p className="text-2xl font-bold">{properties?.length ?? 0}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">Pending approvals</p><p className="text-2xl font-bold">{pending?.length ?? 0}</p></div>
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-3">The Vault</h2>
        <div className="space-y-2">
          {properties?.map((p) => <Link key={p.id} href={`/owner/properties/${p.id}`} className="block border border-gray-200 rounded-md p-3">{p.address}</Link>)}
        </div>
      </div>
    </div>
  )
}

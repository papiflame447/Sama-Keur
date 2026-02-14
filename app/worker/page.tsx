import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function WorkerHome() {
  const supabase = await createClient()
  const { data: leases } = await supabase.from('leases').select('id,tenant_full_name,status,created_at').order('created_at', { ascending: false }).limit(20)
  return (
    <div className="space-y-4">
      <Link href="/worker/intake/new" className="btn-primary w-full">New Intake</Link>
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Recent leases</h2>
        <div className="space-y-2">
          {leases?.map((l) => <Link key={l.id} href={`/worker/leases/${l.id}`} className="block p-3 border border-gray-200 rounded-md text-sm">{l.tenant_full_name} · {l.status}</Link>)}
        </div>
      </div>
    </div>
  )
}

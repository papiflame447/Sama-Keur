import { createClient } from '@/lib/supabase/server'

export default async function WorkerLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lease } = await supabase.from('leases').select('*').eq('id', id).single()
  const { data: payments } = await supabase.from('payments').select('*').eq('lease_id', id)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Lease details</h1>
      <div className="card p-4 text-sm">
        <p>{lease?.tenant_full_name}</p>
        <p>{lease?.status}</p>
      </div>
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Payment ledger</h2>
        {payments?.map((p) => <p key={p.id} className="text-sm">{p.method} · {p.amount}</p>)}
      </div>
    </div>
  )
}

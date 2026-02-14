import { addWorkerAccess, revokeWorkerAccess } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'

type WorkerProfile = {
  id: string
  full_name: string | null
  phone: string | null
}

type WorkerAccessRow = {
  id: string
  worker: WorkerProfile | WorkerProfile[] | null
}

function normalizeWorker(worker: WorkerAccessRow['worker']): WorkerProfile | null {
  if (Array.isArray(worker)) return worker[0] ?? null
  return worker
}

export default async function OwnerWorkersPage() {
  const supabase = await createClient()
  const { data: me } = await supabase.auth.getUser()
  const ownerId = me.user!.id
  const { data: workers } = await supabase
    .from('worker_access')
    .select('id,worker:profiles!worker_access_worker_id_fkey(id,full_name,phone)')
    .eq('owner_id', ownerId)
    .returns<WorkerAccessRow[]>()

  const full = (workers?.length ?? 0) >= 2

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Worker Seats</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {[0, 1].map((slot) => {
          const entry = workers?.[slot]
          const worker = entry ? normalizeWorker(entry.worker) : null

          return (
            <div key={slot} className="card p-4">
              {entry && worker ? (
                <div>
                  <p className="font-semibold">{worker.full_name ?? 'Unnamed worker'}</p>
                  <p className="text-sm">{worker.phone ?? 'No phone'}</p>
                  <form action={revokeWorkerAccess}>
                    <input type="hidden" name="id" value={entry.id} />
                    <button className="btn-secondary mt-2">Revoke</button>
                  </form>
                </div>
              ) : (
                <p className="text-slate-500">Empty slot</p>
              )}
            </div>
          )
        })}
      </div>
      <div className="card p-4">
        <h2 className="font-semibold">Add Worker</h2>
        {full ? (
          <p className="mt-2 text-sm text-amber-600">Delete to Add: remove one worker before adding another.</p>
        ) : (
          <form action={addWorkerAccess} className="mt-3 grid md:grid-cols-3 gap-2">
            <input type="hidden" name="owner_id" value={ownerId} />
            <input name="phone" className="input" placeholder="Worker phone" required />
            <button className="btn-primary">Add Worker</button>
          </form>
        )}
      </div>
    </div>
  )
}

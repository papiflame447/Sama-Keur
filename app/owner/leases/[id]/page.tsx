import { approveLease, markCheckinReviewed, rejectLease } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'

export default async function OwnerLeasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: lease } = await supabase.from('leases').select('*').eq('id', id).single()
  const { data: media } = await supabase.from('audit_media').select('*').eq('lease_id', id)
  const checkin = media?.find((m) => m.media_type === 'checkin_video')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Lease Approval</h1>
      <div className="card p-4 space-y-2">
        <p>Tenant: {lease?.tenant_full_name}</p>
        <p>Status: <span className="font-semibold">{lease?.status}</span></p>
        <p>Code: {lease?.check_in_code}</p>
        {checkin ? <p className="text-sm">Check-in video available.</p> : <p className="text-sm text-red-600">Missing check-in video</p>}
      </div>
      <div className="flex gap-2">
        <form action={markCheckinReviewed}><input type="hidden" name="lease_id" value={id} /><button className="btn-secondary">I have reviewed the video</button></form>
        <form action={approveLease}><input type="hidden" name="lease_id" value={id} /><button className="btn-primary">Approve check-in</button></form>
        <form action={rejectLease}><input type="hidden" name="lease_id" value={id} /><button className="btn-secondary">Reject</button></form>
      </div>
    </div>
  )
}

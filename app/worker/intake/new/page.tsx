'use client'

import { useState } from 'react'
import { createLeaseFromWorker } from '@/lib/actions'
import { VideoRecorder } from '@/components/worker/video-recorder'

export default function NewIntakePage() {
  const [duration, setDuration] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')

  return (
    <form action={createLeaseFromWorker} className="space-y-3">
      <h1 className="text-xl font-bold">Standardized Intake Wizard</h1>
      <input name="property_id" className="input" placeholder="Property ID" required />
      <input name="tenant_full_name" className="input" placeholder="Tenant full name" required />
      <input name="tenant_phone" className="input" placeholder="Tenant phone" required />
      <select name="lease_type" className="input" defaultValue="short"><option value="short">Short</option><option value="long">Long</option></select>
      <input name="start_date" type="date" className="input" required />
      <input name="end_date" type="date" className="input" />
      <input name="id_photo_url" className="input" placeholder="KYC photo path (private-kyc/...)" required />
      <VideoRecorder onRecorded={(d, p) => { setDuration(d); setVideoUrl(p) }} />
      <input name="checkin_video_url" className="input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Check-in video path" required />
      <input name="duration_seconds" className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
      <button className="btn-primary w-full" disabled={duration < 25}>Submit for approval (min 25s)</button>
    </form>
  )
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateCheckInCode } from '@/lib/utils'

export async function signUpAction(formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['owner', 'worker']),
    full_name: z.string().min(2),
    phone: z.string().min(6)
  })
  const values = schema.parse(Object.fromEntries(formData))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email: values.email, password: values.password })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').upsert({ id: data.user.id, ...values })
  }
  redirect('/auth/login')
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  const { data: me } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', me.user!.id).single()
  redirect(profile?.role === 'owner' ? '/owner' : '/worker')
}

export async function addWorkerAccess(formData: FormData) {
  const supabase = await createClient()
  const ownerId = String(formData.get('owner_id'))
  const phone = String(formData.get('phone'))
  const { data: worker } = await supabase.from('profiles').select('id,role').eq('phone', phone).single()
  if (!worker || worker.role !== 'worker') throw new Error('Worker not found. Ask worker to sign up first.')
  const { error } = await supabase.from('worker_access').insert({ owner_id: ownerId, worker_id: worker.id })
  if (error) throw error
  revalidatePath('/owner/workers')
}

export async function revokeWorkerAccess(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('worker_access').delete().eq('id', String(formData.get('id')))
  revalidatePath('/owner/workers')
}

export async function createLeaseFromWorker(formData: FormData) {
  const schema = z.object({
    property_id: z.string().uuid(),
    tenant_full_name: z.string().min(2),
    tenant_phone: z.string().min(6),
    lease_type: z.enum(['short', 'long']),
    start_date: z.string().min(1),
    end_date: z.string().optional(),
    id_photo_url: z.string().min(1),
    checkin_video_url: z.string().min(1),
    duration_seconds: z.coerce.number().min(25)
  })
  const v = schema.parse(Object.fromEntries(formData))
  const { data: me } = await (await createClient()).auth.getUser()
  const supabase = await createClient()
  const { data: lease, error } = await supabase.from('leases').insert({
    property_id: v.property_id,
    tenant_full_name: v.tenant_full_name,
    tenant_phone: v.tenant_phone,
    lease_type: v.lease_type,
    start_date: v.start_date,
    end_date: v.end_date || null,
    check_in_code: generateCheckInCode(),
    created_by: me.user?.id
  }).select('*').single()
  if (error) throw error
  await supabase.from('audit_media').insert([
    { lease_id: lease.id, media_type: 'id_card', file_url: v.id_photo_url, created_by: me.user?.id },
    { lease_id: lease.id, media_type: 'checkin_video', file_url: v.checkin_video_url, duration_seconds: v.duration_seconds, created_by: me.user?.id }
  ])
  revalidatePath('/worker')
  redirect(`/worker/leases/${lease.id}`)
}

export async function markCheckinReviewed(formData: FormData) {
  const supabase = await createClient()
  await supabase.from('leases').update({ checkin_reviewed_at: new Date().toISOString() }).eq('id', String(formData.get('lease_id')))
  revalidatePath(`/owner/leases/${String(formData.get('lease_id'))}`)
}

export async function approveLease(formData: FormData) {
  const leaseId = String(formData.get('lease_id'))
  const supabase = await createClient()
  const { data: me } = await supabase.auth.getUser()
  const { data: checkin } = await supabase.from('audit_media').select('id').eq('lease_id', leaseId).eq('media_type', 'checkin_video').maybeSingle()
  const { data: lease } = await supabase.from('leases').select('checkin_reviewed_at').eq('id', leaseId).single()
  if (!checkin || !lease?.checkin_reviewed_at) throw new Error('Check-in review prerequisite not met')
  await supabase.from('leases').update({ status: 'active', approved_at: new Date().toISOString(), approved_by: me.user?.id }).eq('id', leaseId)
  revalidatePath(`/owner/leases/${leaseId}`)
}

export async function rejectLease(formData: FormData) {
  const leaseId = String(formData.get('lease_id'))
  const supabase = await createClient()
  await supabase.from('leases').update({ status: 'rejected' }).eq('id', leaseId)
  revalidatePath(`/owner/leases/${leaseId}`)
}

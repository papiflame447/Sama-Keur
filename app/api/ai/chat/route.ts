import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

type ChatRole = 'guest' | 'assistant' | 'system'

type ChatMessage = {
  role: ChatRole
  content: string
}

type LeasePropertyContext = {
  ai_knowledge: string | null
  house_rules: string | null
}

type LeaseRow = {
  id: string
  status: 'pending_approval' | 'active' | 'inactive' | 'rejected'
  property: LeasePropertyContext | LeasePropertyContext[] | null
}

const messageSchema = z.object({
  role: z.enum(['guest', 'assistant', 'system']),
  content: z.string().min(1)
})

const modernBodySchema = z.object({
  leaseId: z.string().uuid().optional(),
  messages: z.array(messageSchema).min(1)
})

const legacyBodySchema = z.object({
  message: z.string().min(1),
  leaseId: z.string().uuid().optional()
})

const chatBodySchema = z.union([modernBodySchema, legacyBodySchema])

function normalizePropertyContext(property: LeaseRow['property']): LeasePropertyContext {
  if (Array.isArray(property)) return property[0] ?? { ai_knowledge: null, house_rules: null }
  return property ?? { ai_knowledge: null, house_rules: null }
}

function getLastGuestMessage(input: z.infer<typeof chatBodySchema>): ChatMessage {
  if ('messages' in input) {
    const guestMessage = [...input.messages].reverse().find((message) => message.role === 'guest')
    return guestMessage ?? input.messages[input.messages.length - 1]
  }

  return { role: 'guest', content: input.message }
}

export async function POST(req: Request) {
  const rawBody: unknown = await req.json()
  const parsed = chatBodySchema.safeParse(rawBody)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid chat payload' }, { status: 400 })
  }

  const leaseIdFromCookie = (await cookies()).get('guest_lease_id')?.value
  const requestedLeaseId = parsed.data.leaseId
  const effectiveLeaseId = requestedLeaseId ?? leaseIdFromCookie

  if (!effectiveLeaseId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: lease } = await supabase
    .from('leases')
    .select('id,status,property:properties(ai_knowledge,house_rules)')
    .eq('id', effectiveLeaseId)
    .single<LeaseRow>()

  if (!lease || lease.status !== 'active') {
    return NextResponse.json({ error: 'Lease inactive' }, { status: 403 })
  }

  const property = normalizePropertyContext(lease.property)
  const latestGuestMessage = getLastGuestMessage(parsed.data)
  const context = `Rules: ${property.house_rules ?? ''}\nKnowledge: ${property.ai_knowledge ?? ''}`
  const reply = `Sama Keur assistant: ${latestGuestMessage.content}\n\n${context.slice(0, 300)}`

  await supabase.from('ai_logs').insert([
    { lease_id: effectiveLeaseId, role: 'guest', content: latestGuestMessage.content },
    { lease_id: effectiveLeaseId, role: 'assistant', content: reply }
  ])

  return NextResponse.json({ reply })
}

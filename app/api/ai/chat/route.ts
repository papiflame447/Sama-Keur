import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { message } = await req.json()
  const leaseId = (await cookies()).get('guest_lease_id')?.value
  if (!leaseId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createClient()
  const { data: lease } = await supabase
    .from('leases')
    .select('id,status,property:properties(ai_knowledge,house_rules)')
    .eq('id', leaseId)
    .single()

  if (!lease || lease.status !== 'active') return NextResponse.json({ error: 'Lease inactive' }, { status: 403 })

  const context = `Rules: ${(lease.property as any).house_rules ?? ''}\nKnowledge: ${(lease.property as any).ai_knowledge ?? ''}`
  const reply = `Sama Keur assistant: ${message}\n\n${context.slice(0, 300)}`

  await supabase.from('ai_logs').insert([
    { lease_id: leaseId, role: 'guest', content: message },
    { lease_id: leaseId, role: 'assistant', content: reply }
  ])

  return NextResponse.json({ reply })
}

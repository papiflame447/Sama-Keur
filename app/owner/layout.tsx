import { OwnerLayoutShell } from '@/components/owner/layout'
import { requireRole } from '@/lib/auth'

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requireRole('owner')
  return <OwnerLayoutShell>{children}</OwnerLayoutShell>
}

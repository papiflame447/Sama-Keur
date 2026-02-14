import { requireRole } from '@/lib/auth'
import Link from 'next/link'

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  await requireRole('worker')
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 border-b border-gray-200 bg-white p-4 flex justify-between">
        <strong>Worker Tool</strong>
        <Link href="/worker" className="text-sm">Home</Link>
      </header>
      <main className="p-4 max-w-xl mx-auto">{children}</main>
    </div>
  )
}

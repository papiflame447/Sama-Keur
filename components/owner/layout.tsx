import Link from 'next/link'

export function OwnerLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="bg-slate-900 text-white p-4 space-y-2">
        <div className="font-bold mb-4">SK Owner Console</div>
        <Link href="/owner" className="block text-sm">Dashboard</Link>
        <Link href="/owner/workers" className="block text-sm">Worker Seats</Link>
        <Link href="/owner/properties" className="block text-sm">Properties</Link>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  )
}

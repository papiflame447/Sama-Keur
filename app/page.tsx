import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="font-bold text-slate-900">SK · Sama Keur</div>
          <div className="flex gap-3">
            <Link className="btn-secondary" href="/auth/login">Log in</Link>
            <Link className="btn-primary" href="/auth/signup">Get started</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-900">Institutional Trust Engine for Rental Operations</h1>
        <p className="mt-4 max-w-2xl text-slate-700">Owners delegate operations to workers while retaining strict approval control. Every check-in is audited, approval-gated, and AI-assisted only after activation.</p>
      </section>
    </main>
  )
}

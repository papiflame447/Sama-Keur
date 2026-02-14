import { signInAction } from '@/lib/actions'

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Log in</h1>
        <form action={signInAction} className="mt-4 space-y-3">
          <input name="email" type="email" placeholder="Email" className="input" required />
          <input name="password" type="password" placeholder="Password" className="input" required />
          <button className="btn-primary w-full">Continue</button>
        </form>
      </div>
    </main>
  )
}

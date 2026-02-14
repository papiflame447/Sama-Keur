import { signUpAction } from '@/lib/actions'

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Create account</h1>
        <form action={signUpAction} className="mt-4 space-y-3">
          <input name="full_name" className="input" placeholder="Full name" required />
          <input name="phone" className="input" placeholder="Phone" required />
          <input name="email" type="email" className="input" placeholder="Email" required />
          <input name="password" type="password" className="input" placeholder="Password" required />
          <select name="role" className="input" defaultValue="worker">
            <option value="owner">Owner</option>
            <option value="worker">Worker</option>
          </select>
          <button className="btn-primary w-full">Sign up</button>
        </form>
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GuestVerifyPage() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function submit(formData: FormData) {
    const code = formData.get('code')
    const phone = formData.get('phone')
    const res = await fetch('/api/guest/verify', { method: 'POST', body: JSON.stringify({ code, phone }) })
    const data = await res.json()
    if (data.ok) router.push('/guest/chat')
    else setMessage(data.message)
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Guest Verification</h1>
      <form action={submit} className="space-y-2">
        <input name="code" className="input" placeholder="Check-in code" required />
        <input name="phone" className="input" placeholder="Phone" required />
        <button className="btn-primary w-full">Verify</button>
      </form>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </main>
  )
}

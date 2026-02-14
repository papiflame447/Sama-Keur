'use client'

import { useState } from 'react'

export default function GuestChatPage() {
  const [text, setText] = useState('')
  const [reply, setReply] = useState('')

  async function send() {
    const res = await fetch('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message: text }) })
    const data = await res.json()
    setReply(data.reply || data.error)
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Guest Concierge</h1>
      <p className="text-sm text-slate-600">House info and AI assistance unlock only after owner approval.</p>
      <textarea className="input min-h-28" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={send} className="btn-primary w-full">Send</button>
      {reply && <div className="card p-3 text-sm whitespace-pre-wrap">{reply}</div>}
    </main>
  )
}

'use client'

import { useRef, useState } from 'react'

export default function GuestSignPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    ctx.stroke()
  }

  return (
    <main className="max-w-md mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Tenant Signature</h1>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" required /> I agree</label>
      <canvas ref={canvasRef} width={320} height={200} className="border border-gray-200 rounded-md bg-white"
        onMouseDown={() => setDrawing(true)} onMouseUp={() => setDrawing(false)} onMouseMove={draw} />
      <button className="btn-primary w-full">Save signature</button>
    </main>
  )
}

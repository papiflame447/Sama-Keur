'use client'

import { useRef, useState } from 'react'

export function VideoRecorder({ onRecorded }: { onRecorded: (duration: number, filePath: string) => void }) {
  const mediaRef = useRef<MediaRecorder | null>(null)
  const startRef = useRef<number>(0)
  const [recording, setRecording] = useState(false)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    const recorder = new MediaRecorder(stream)
    mediaRef.current = recorder
    startRef.current = Date.now()
    recorder.ondataavailable = () => {}
    recorder.onstop = () => {
      const duration = Math.round((Date.now() - startRef.current) / 1000)
      onRecorded(duration, `audit-logs/local/checkin-${Date.now()}.webm`)
    }
    recorder.start()
    setRecording(true)
  }

  function stop() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  return (
    <div className="space-y-2">
      {!recording ? <button type="button" className="btn-secondary" onClick={start}>Start recording</button> : <button type="button" className="btn-primary" onClick={stop}>Stop recording</button>}
    </div>
  )
}

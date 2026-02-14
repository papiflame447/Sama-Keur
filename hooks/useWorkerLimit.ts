'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWorkerLimit(ownerId: string, limit = 2) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const supabase = createClient()
    supabase.from('worker_access').select('id', { count: 'exact', head: true }).eq('owner_id', ownerId)
      .then(({ count }) => setCount(count ?? 0))
  }, [ownerId])

  return { count, isFull: count >= limit }
}

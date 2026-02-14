import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: properties } = await supabase.from('properties').select('id,address,rent_amount')
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Properties</h1>
      {properties?.map((p) => (
        <Link key={p.id} href={`/owner/properties/${p.id}`} className="card block p-4">
          <p className="font-semibold">{p.address}</p>
          <p className="text-sm text-slate-500">Rent: {p.rent_amount ?? '-'} XOF</p>
        </Link>
      ))}
    </div>
  )
}

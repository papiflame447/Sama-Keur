import type { LucideProps } from 'lucide-react'

export function iconProps(props?: LucideProps): LucideProps {
  return { strokeWidth: 1.5, ...props }
}

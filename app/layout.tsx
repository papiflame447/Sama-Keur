import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppToaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'] })

export const metadata: Metadata = {
  title: 'Sama Keur – Institutional Trust Engine',
  description: 'Institutional trust engine for rental operations in Senegal'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <AppToaster />
      </body>
    </html>
  )
}

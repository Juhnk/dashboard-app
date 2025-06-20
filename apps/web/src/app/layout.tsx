import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/auth-provider'
import { QueryProvider } from '@/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mustache Cashstache',
  description: 'Unify, visualize, and act on your marketing data',
  keywords: 'marketing analytics, dashboard, data visualization, campaign performance',
  authors: [{ name: 'Mustache Cashstache Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <QueryProvider>
            <div id="root">
              {children}
            </div>
          </QueryProvider>
        </AuthProvider>
        <div id="modal-root" />
        <div id="tooltip-root" />
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'JobTrack',
    template: '%s · JobTrack',   // Pages can set their own title; this wraps it
  },
  description: 'Track your job applications across every stage of the hiring pipeline.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

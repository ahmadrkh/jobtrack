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
    <html lang="en" suppressHydrationWarning>
      {/*
        Anti-flash script: runs synchronously BEFORE React hydrates,
        so the correct theme class is applied before the first paint.
        Without this, users would briefly see the wrong theme (a "flash").
        suppressHydrationWarning on <html> is required because this script
        mutates the className before React expects to control it.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme')
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-900 min-h-screen transition-colors duration-200`}>
        {children}
      </body>
    </html>
  )
}

// Login page — shown to unauthenticated visitors.
// Uses a client component for the sign-in button (needs onClick / useSession).
// The page shell itself is a server component for fast initial load.

import type { Metadata } from 'next'
import { LoginButton } from './LoginButton'
import { Briefcase } from 'lucide-react'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">

        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JobTrack</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your personal job-hunt Kanban board
            </p>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="rounded-xl border bg-card p-8 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="font-semibold">Sign in to your board</h2>
            <p className="text-sm text-muted-foreground">
              Your applications are private and tied to your account.
            </p>
          </div>
          <LoginButton />
        </div>

        <p className="text-xs text-muted-foreground">
          We only request your public GitHub profile. No write access.
        </p>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { WifiOff, Briefcase } from 'lucide-react'
import { ReloadButton } from './ReloadButton'

export const metadata = {
  title: 'Offline',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Briefcase className="h-14 w-14 text-primary opacity-30" />
          <WifiOff className="h-6 w-6 text-destructive absolute -bottom-1 -right-1" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">You're offline</h1>
        <p className="text-muted-foreground max-w-sm">
          JobTrack can't reach the server right now. Check your connection and try again.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <ReloadButton />
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Go home
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        Previously loaded pages may still be available from cache.
      </p>
    </div>
  )
}

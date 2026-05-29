import { Header }       from '@/components/layout/Header'
import { JobListings }  from '@/components/jobs/JobListings'
import { Globe2 }       from 'lucide-react'

export const metadata = { title: 'Find Jobs' }

export default function JobsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Globe2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Find Remote Jobs</h1>
            <p className="text-sm text-muted-foreground">
              Live listings from Remotive · click "Add to Board" to save any job to your Wishlist.
            </p>
          </div>
        </div>

        <JobListings />
      </main>
    </div>
  )
}

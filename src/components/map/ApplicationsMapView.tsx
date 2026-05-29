'use client'

import dynamic from 'next/dynamic'
import { useApplications } from '@/hooks/useApplications'
import { Loader2, MapPin } from 'lucide-react'

const AllPinsMap = dynamic(() => import('./AllPinsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

export function ApplicationsMapView() {
  const { data: applications = [], isLoading } = useApplications()
  const withLocation = applications.filter(a => a.location)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (withLocation.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <MapPin className="h-10 w-10 opacity-30" />
        <p className="text-sm">No applications have a location yet.</p>
        <p className="text-xs">Add a location when creating or editing a job card.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Legend */}
      <div className="px-4 py-2 border-b text-xs text-muted-foreground">
        Showing {withLocation.length} of {applications.length} applications with a location
      </div>
      {/* Map */}
      <div className="flex-1 min-h-0">
        <AllPinsMap applications={withLocation} />
      </div>
    </div>
  )
}

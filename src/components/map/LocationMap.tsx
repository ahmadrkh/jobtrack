'use client'

// react-leaflet must be dynamically imported (no SSR) because Leaflet reads
// window.document on load. This component is the SSR-safe wrapper.
// Usage:  <LocationMap location="Berlin, Germany" />
//         <LocationMap lat={52.52} lng={13.40} label="Berlin" />

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-lg bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground">
      Loading map…
    </div>
  ),
})

interface Props {
  location?: string | null
  lat?: number
  lng?: number
  label?: string
  className?: string
}

export function LocationMap({ location, lat, lng, label, className }: Props) {
  if (!location && (lat === undefined || lng === undefined)) return null
  return (
    <div className={className ?? 'w-full h-40 rounded-lg overflow-hidden border'}>
      <LeafletMap location={location} lat={lat} lng={lng} label={label} />
    </div>
  )
}

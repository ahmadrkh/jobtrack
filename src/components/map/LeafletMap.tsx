'use client'

// The actual Leaflet implementation — only ever rendered client-side
// (imported via dynamic() from LocationMap.tsx with ssr:false).

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geocode } from '@/lib/geocode'

// Fix Leaflet's default icon paths when bundled with webpack/turbopack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

// Helper component — flies to new coords when they change
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], 12) }, [lat, lng, map])
  return null
}

interface Props {
  location?: string | null
  lat?: number
  lng?: number
  label?: string
}

export default function LeafletMap({ location, lat: propLat, lng: propLng, label }: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    propLat !== undefined && propLng !== undefined ? { lat: propLat, lng: propLng } : null,
  )
  const [error, setError] = useState(false)

  useEffect(() => { fixLeafletIcons() }, [])

  useEffect(() => {
    if (!location) return
    geocode(location).then(result => {
      if (result) setCoords(result)
      else setError(true)
    })
  }, [location])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted rounded-lg">
        Location not found
      </div>
    )
  }

  if (!coords) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted animate-pulse rounded-lg">
        Locating…
      </div>
    )
  }

  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg z-0"
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo lat={coords.lat} lng={coords.lng} />
      <Marker position={[coords.lat, coords.lng]}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  )
}

'use client'

// Full-screen map rendered client-only.
// Geocodes each application location and drops a colour-coded pin.

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geocode } from '@/lib/geocode'
import type { Application, Status } from '@/types'

// Status → pin colour (matches Kanban column colours)
const STATUS_COLOR: Record<Status, string> = {
  WISHLIST:     '#94a3b8',
  APPLIED:      '#60a5fa',
  PHONE_SCREEN: '#a78bfa',
  INTERVIEW:    '#22d3ee',
  OFFER:        '#4ade80',
  REJECTED:     '#f87171',
}

function colourMarker(color: string) {
  return L.divIcon({
    className: '',
    html: `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20S24 21 24 12C24 5.4 18.6 0 12 0z"
            fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>`,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  })
}

interface GeoApp {
  app: Application
  lat: number
  lng: number
}

interface Props {
  applications: Application[]
}

export default function AllPinsMap({ applications }: Props) {
  const [pins, setPins] = useState<GeoApp[]>([])
  const didInit = useRef(false)

  useEffect(() => {
    // Fix Leaflet icons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    // Geocode all locations with a small delay between requests (Nominatim 1 req/s)
    async function loadPins() {
      const results: GeoApp[] = []
      for (const app of applications) {
        if (!app.location) continue
        const coords = await geocode(app.location)
        if (coords) results.push({ app, ...coords })
        // Brief pause to respect Nominatim rate limit
        await new Promise(r => setTimeout(r, 200))
      }
      setPins(results)
    }
    loadPins()
  }, [applications])

  // Default centre: slightly off [0,0] so tiles load correctly
  const centre: [number, number] = pins.length > 0
    ? [pins[0].lat, pins[0].lng]
    : [20, 0]

  return (
    <MapContainer
      center={centre}
      zoom={pins.length > 0 ? 5 : 2}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map(({ app, lat, lng }) => (
        <Marker
          key={app.id}
          position={[lat, lng]}
          icon={colourMarker(STATUS_COLOR[app.status])}
        >
          <Popup>
            <div className="text-sm space-y-0.5">
              <p className="font-semibold">{app.company}</p>
              <p className="text-muted-foreground">{app.role}</p>
              <p className="text-xs">{app.location}</p>
              <span
                className="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: STATUS_COLOR[app.status] + '33', color: STATUS_COLOR[app.status] }}
              >
                {app.status.replace('_', ' ')}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

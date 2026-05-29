import { Header }               from '@/components/layout/Header'
import { ApplicationsMapView }  from '@/components/map/ApplicationsMapView'

export const metadata = { title: 'Map' }

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Full-height map below the header */}
      <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <ApplicationsMapView />
      </div>
    </div>
  )
}

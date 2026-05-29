import HeaderWithDataClient from '@/components/layout/HeaderWithData'
import { BoardOrListView } from '@/components/BoardOrListView'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderWithDataClient />
      <main className="flex-1 overflow-hidden">
        <BoardOrListView />
      </main>
    </div>
  )
}

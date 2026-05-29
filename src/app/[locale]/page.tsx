import { HeaderWithData }   from '@/components/layout/HeaderWithData'
import { BoardOrListView }  from '@/components/BoardOrListView'

export default function BoardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderWithData />
      <main className="flex-1 overflow-hidden">
        <BoardOrListView />
      </main>
    </div>
  )
}

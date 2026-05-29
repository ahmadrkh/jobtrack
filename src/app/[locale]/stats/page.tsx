import { Header }    from '@/components/layout/Header'
import { StatsPage } from '@/components/stats/StatsPage'

export default function Stats() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6">
        <StatsPage />
      </main>
    </div>
  )
}

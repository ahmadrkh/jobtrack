'use client'

import { Header } from './Header'
import { useApplications } from '@/hooks/useApplications'

// Reads the query cache (populated by KanbanBoard) and passes
// applications to Header for CSV export. Zero extra network requests.
export default function HeaderWithData() {
  const { data: applications = [] } = useApplications()
  return <Header applications={applications} />
}

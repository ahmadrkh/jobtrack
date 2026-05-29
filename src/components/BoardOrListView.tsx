'use client'

// Owns the Board ↔ List toggle and renders whichever view is active.
// Keeping the toggle here (not in the header) means the header
// stays stateless and easier to test.

import { useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { ApplicationsTable } from '@/components/list/ApplicationsTable'
import { useApplications } from '@/hooks/useApplications'
import { cn } from '@/lib/utils'

type View = 'board' | 'list'

export function BoardOrListView() {
  const [view, setView] = useState<View>('board')
  const { data: applications = [], isLoading } = useApplications()

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* View toggle bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-0.5 rounded-md border p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1.5 text-xs rounded-sm px-2.5',
              view === 'board' && 'bg-background shadow-sm'
            )}
            onClick={() => setView('board')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 gap-1.5 text-xs rounded-sm px-2.5',
              view === 'list' && 'bg-background shadow-sm'
            )}
            onClick={() => setView('list')}
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>
        </div>
        <span className="ml-2 text-xs text-muted-foreground">
          {isLoading ? '…' : `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Active view */}
      <div className="flex-1 overflow-hidden">
        {view === 'board'
          ? <KanbanBoard />
          : <div className="h-full overflow-y-auto">
              <ApplicationsTable data={applications} />
            </div>
        }
      </div>
    </div>
  )
}

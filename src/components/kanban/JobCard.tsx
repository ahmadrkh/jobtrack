'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ExternalLink, Pencil, Trash2, MapPin, DollarSign,
  ChevronDown, ChevronUp, Bell, BellOff,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AddJobDialog } from './AddJobDialog'
import { EventTimeline } from './EventTimeline'
import { useDeleteApplication } from '@/hooks/useApplications'
import { formatDate, cn } from '@/lib/utils'
import type { Application } from '@/types'

// Returns how many days until the follow-up date (negative = overdue)
function daysUntil(iso: string) {
  return Math.ceil(
    (new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0))
    / (1000 * 60 * 60 * 24)
  )
}

interface JobCardProps { application: Application }

export function JobCard({ application }: JobCardProps) {
  const deleteApp              = useDeleteApplication()
  const [editOpen, setEditOpen]   = useState(false)
  const [expanded, setExpanded]   = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: application.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const stopDrag = (e: React.PointerEvent) => e.stopPropagation()

  // Follow-up badge logic
  const followUpDays = application.followUpAt ? daysUntil(application.followUpAt) : null
  const followUpOverdue = followUpDays !== null && followUpDays <= 0
  const followUpSoon    = followUpDays !== null && followUpDays > 0 && followUpDays <= 3

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'group cursor-grab active:cursor-grabbing select-none',
          'transition-shadow hover:shadow-md',
          isDragging && 'shadow-2xl ring-2 ring-primary/50',
          followUpOverdue && 'ring-1 ring-orange-400/60',
        )}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-3 space-y-2">

          {/* Company + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{application.company}</p>
              <p className="text-xs text-muted-foreground truncate">{application.role}</p>
            </div>
            <div
              className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onPointerDown={stopDrag}
            >
              {application.jobUrl && (
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" aria-label="Open posting">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 hover:text-destructive"
                onClick={() => deleteApp.mutate(application.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {application.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{application.location}
              </span>
            )}
            {application.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />{application.salary}
              </span>
            )}
            {application.appliedAt && (
              <span>{formatDate(application.appliedAt)}</span>
            )}
          </div>

          {/* Follow-up reminder badge */}
          {application.followUpAt && (
            <div onPointerDown={stopDrag}>
              <button
                onClick={() => setEditOpen(true)}
                className={cn(
                  'flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium transition-colors',
                  followUpOverdue
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    : followUpSoon
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-muted text-muted-foreground',
                )}
                aria-label="Edit follow-up date"
              >
                {followUpOverdue ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                {followUpOverdue
                  ? `Overdue · ${formatDate(application.followUpAt)}`
                  : followUpSoon
                  ? `Follow up in ${followUpDays}d`
                  : `Follow up ${formatDate(application.followUpAt)}`}
              </button>
            </div>
          )}

          {/* Activity toggle */}
          <div onPointerDown={stopDrag}>
            <Button
              variant="ghost" size="sm"
              className="h-6 w-full text-xs text-muted-foreground hover:text-foreground justify-between px-1"
              onClick={() => setExpanded(v => !v)}
            >
              Activity
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            {expanded && <EventTimeline applicationId={application.id} />}
          </div>

        </CardContent>
      </Card>

      <AddJobDialog open={editOpen} onOpenChange={setEditOpen} editApp={application} />
    </>
  )
}

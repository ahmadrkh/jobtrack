'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ExternalLink, MapPin, Banknote, Trash2, Pencil, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Application } from '@/types'
import { EventTimeline } from './EventTimeline'

interface JobCardProps {
  application: Application
  onDelete: (id: string) => void
  onEdit:   (app: Application) => void
}

export function JobCard({ application, onDelete, onEdit }: JobCardProps) {
  const [expanded, setExpanded] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200
                 dark:border-slate-700 p-3 shadow-sm cursor-grab active:cursor-grabbing
                 hover:shadow-md transition-shadow group"
    >
      {/* ── Card header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
            {application.company}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {application.role}
          </p>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onEdit(application) }}
            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50
                       dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(application.id) }}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50
                       dark:hover:bg-red-900/30 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Meta row ── */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {application.location && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <MapPin className="w-3 h-3" />
            {application.location}
          </span>
        )}
        {application.salary && (
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <Banknote className="w-3 h-3" />
            {application.salary}
          </span>
        )}
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View job
          </a>
        )}
      </div>

      {/* ── Expand / collapse timeline button ── */}
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
        className="mt-2 flex items-center gap-1 text-[10px] font-medium
                   text-slate-400 hover:text-blue-600 dark:hover:text-blue-400
                   transition-colors w-full"
        aria-label={expanded ? 'Collapse activity' : 'Expand activity'}
      >
        {expanded
          ? <><ChevronUp className="w-3 h-3" /> Hide activity</>
          : <><ChevronDown className="w-3 h-3" /> Show activity</>}
      </button>

      {/* ── Activity timeline (lazy-loaded) ── */}
      {expanded && <EventTimeline applicationId={application.id} />}
    </div>
  )
}

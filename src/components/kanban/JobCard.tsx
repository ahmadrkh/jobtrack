'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ExternalLink, MapPin, Banknote, Trash2, Pencil } from 'lucide-react'
import { Application } from '@/types'
import { formatDate } from '@/lib/utils'

interface JobCardProps {
  application: Application
  onDelete: (id: string) => void
  onEdit: (app: Application) => void
}

export function JobCard({ application, onDelete, onEdit }: JobCardProps) {
  // dnd-kit hook — gives us drag handle props and transform styles
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    await fetch(`/api/applications/${application.id}`, { method: 'DELETE' })
    onDelete(application.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing group"
      {...attributes}
      {...listeners}
    >
      {/* Company + delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-slate-900 truncate">{application.company}</p>
          <p className="text-xs text-slate-500 truncate">{application.role}</p>
        </div>
        {/* Edit + Delete — only visible on hover via group-hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 flex-shrink-0 transition-all">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(application) }}
            className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
            aria-label="Edit application"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            aria-label="Delete application"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-2 space-y-1">
        {application.location && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            {application.location}
          </div>
        )}
        {application.salary && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Banknote className="w-3 h-3" />
            {application.salary}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {application.appliedAt ? formatDate(application.appliedAt) : formatDate(application.createdAt)}
        </span>
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-500 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

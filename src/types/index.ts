// ── Application ───────────────────────────────────────────────────────────────

export type Status =
  | 'WISHLIST'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export interface Application {
  id:        string
  company:   string
  role:      string
  status:    Status
  jobUrl:    string | null
  location:  string | null
  salary:    string | null
  notes:     string | null
  appliedAt: string | null
  createdAt: string
  updatedAt: string
}

// ── Event ─────────────────────────────────────────────────────────────────────

export type EventType = 'STATUS_CHANGE' | 'NOTE' | 'CREATED'

export interface Event {
  id:            string
  applicationId: string
  type:          EventType
  content:       string
  createdAt:     string
}

// ── Kanban column config ──────────────────────────────────────────────────────

export interface KanbanColumn {
  id:    Status
  label: string
  color: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'WISHLIST',     label: 'Wishlist',     color: 'bg-slate-100 dark:bg-slate-700' },
  { id: 'APPLIED',      label: 'Applied',      color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'PHONE_SCREEN', label: 'Phone Screen', color: 'bg-violet-50 dark:bg-violet-900/20' },
  { id: 'INTERVIEW',    label: 'Interview',    color: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { id: 'OFFER',        label: 'Offer',        color: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'REJECTED',     label: 'Rejected',     color: 'bg-red-50 dark:bg-red-900/20' },
]

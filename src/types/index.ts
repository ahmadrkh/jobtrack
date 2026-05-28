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
  id:          Status
  label:       string
  color:       string
  headerColor: string
  dotColor:    string
  badgeColor:  string
  columnBg:    string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'WISHLIST',     label: 'Wishlist',
    color:       'bg-slate-100 dark:bg-slate-700',
    headerColor: 'bg-slate-100 dark:bg-slate-700',
    dotColor:    'bg-slate-400',
    badgeColor:  'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300',
    columnBg:    'bg-slate-50 dark:bg-slate-800',
  },
  {
    id: 'APPLIED',      label: 'Applied',
    color:       'bg-blue-50 dark:bg-blue-900/20',
    headerColor: 'bg-blue-50 dark:bg-blue-900/30',
    dotColor:    'bg-blue-400',
    badgeColor:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    columnBg:    'bg-blue-50/50 dark:bg-blue-950/20',
  },
  {
    id: 'PHONE_SCREEN', label: 'Phone Screen',
    color:       'bg-violet-50 dark:bg-violet-900/20',
    headerColor: 'bg-violet-50 dark:bg-violet-900/30',
    dotColor:    'bg-violet-400',
    badgeColor:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    columnBg:    'bg-violet-50/50 dark:bg-violet-950/20',
  },
  {
    id: 'INTERVIEW',    label: 'Interview',
    color:       'bg-cyan-50 dark:bg-cyan-900/20',
    headerColor: 'bg-cyan-50 dark:bg-cyan-900/30',
    dotColor:    'bg-cyan-400',
    badgeColor:  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    columnBg:    'bg-cyan-50/50 dark:bg-cyan-950/20',
  },
  {
    id: 'OFFER',        label: 'Offer',
    color:       'bg-green-50 dark:bg-green-900/20',
    headerColor: 'bg-green-50 dark:bg-green-900/30',
    dotColor:    'bg-green-400',
    badgeColor:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    columnBg:    'bg-green-50/50 dark:bg-green-950/20',
  },
  {
    id: 'REJECTED',     label: 'Rejected',
    color:       'bg-red-50 dark:bg-red-900/20',
    headerColor: 'bg-red-50 dark:bg-red-900/30',
    dotColor:    'bg-red-400',
    badgeColor:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    columnBg:    'bg-red-50/50 dark:bg-red-950/20',
  },
]

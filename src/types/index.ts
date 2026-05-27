// Re-export Prisma's Application type so the rest of the app imports from one place.
// Status is no longer a Prisma enum (SQLite doesn't support enums) — it's a plain
// String in the DB. We define the valid values here as a TypeScript type instead.
export type { Application } from '@prisma/client'

// The six valid status values — enforced by Zod at the API boundary,
// stored as plain strings in SQLite.
export type Status =
  | 'WISHLIST'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

// Column config used by the Kanban board.
export interface KanbanColumn {
  id: string
  label: string
  headerColor: string
  dotColor: string
  badgeColor: string
  columnBg: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'WISHLIST',
    label: 'Wishlist',
    headerColor: 'bg-violet-50',
    dotColor: 'bg-violet-400',
    badgeColor: 'bg-violet-100 text-violet-700',
    columnBg: 'bg-violet-50/50',
  },
  {
    id: 'APPLIED',
    label: 'Applied',
    headerColor: 'bg-blue-50',
    dotColor: 'bg-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700',
    columnBg: 'bg-blue-50/50',
  },
  {
    id: 'PHONE_SCREEN',
    label: 'Phone Screen',
    headerColor: 'bg-amber-50',
    dotColor: 'bg-amber-400',
    badgeColor: 'bg-amber-100 text-amber-700',
    columnBg: 'bg-amber-50/50',
  },
  {
    id: 'INTERVIEW',
    label: 'Interview',
    headerColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-400',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    columnBg: 'bg-emerald-50/50',
  },
  {
    id: 'OFFER',
    label: 'Offer 🎉',
    headerColor: 'bg-green-50',
    dotColor: 'bg-green-400',
    badgeColor: 'bg-green-100 text-green-700',
    columnBg: 'bg-green-50/50',
  },
  {
    id: 'REJECTED',
    label: 'Rejected',
    headerColor: 'bg-red-50',
    dotColor: 'bg-red-400',
    badgeColor: 'bg-red-100 text-red-600',
    columnBg: 'bg-red-50/50',
  },
]

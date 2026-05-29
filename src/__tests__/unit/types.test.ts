// Tests for the KANBAN_COLUMNS constant — ensures the config is internally
// consistent. If someone adds a new Status without adding a column, this catches it.

import { KANBAN_COLUMNS } from '@/types'
import type { Status } from '@/types'

const ALL_STATUSES: Status[] = [
  'WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED',
]

describe('KANBAN_COLUMNS', () => {
  it('has exactly one column per Status', () => {
    const ids = KANBAN_COLUMNS.map(c => c.id)
    expect(ids).toHaveLength(ALL_STATUSES.length)
    ALL_STATUSES.forEach(s => expect(ids).toContain(s))
  })

  it('every column has all required style fields', () => {
    KANBAN_COLUMNS.forEach(col => {
      expect(col.headerColor).toBeTruthy()
      expect(col.dotColor).toBeTruthy()
      expect(col.badgeColor).toBeTruthy()
      expect(col.columnBg).toBeTruthy()
      expect(col.label).toBeTruthy()
    })
  })
})

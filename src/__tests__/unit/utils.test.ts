import { cn, formatDate } from '@/lib/utils'

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2')
  })

  it('resolves Tailwind conflicts — last one wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('ignores falsy values', () => {
    expect(cn('px-2', false, undefined, null, 'py-2')).toBe('px-2 py-2')
  })

  it('handles conditional classes', () => {
    const active = true
    expect(cn('base', active && 'active')).toBe('base active')
    expect(cn('base', !active && 'inactive')).toBe('base')
  })
})

describe('formatDate()', () => {
  it('formats an ISO string', () => {
    expect(formatDate('2025-05-12T00:00:00.000Z')).toMatch(/12 May 2025/)
  })

  it('returns em dash for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('accepts a Date object', () => {
    expect(formatDate(new Date('2025-01-01'))).toMatch(/1 Jan 2025/)
  })
})

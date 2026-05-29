// KanbanBoard smoke + interaction tests.
// We mock the dnd-kit context and TanStack Query so this test file
// focuses purely on rendering and filter behaviour.

import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { Application } from '@/types'

// Mock the entire dnd-kit ecosystem — it needs pointer-events polyfills
jest.mock('@dnd-kit/core', () => ({
  DndContext:    ({ children }: any) => <div>{children}</div>,
  DragOverlay:  ({ children }: any) => <div>{children}</div>,
  PointerSensor: jest.fn(),
  useSensor:    jest.fn(() => ({})),
  useSensors:   jest.fn(() => []),
  closestCenter: jest.fn(),
}))
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext:            ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
  useSortable: () => ({
    attributes: {}, listeners: {}, setNodeRef: jest.fn(),
    transform: null, transition: null, isDragging: false,
  }),
}))
jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))
jest.mock('@/components/kanban/EventTimeline', () => ({
  EventTimeline: () => null,
}))

const mockApplications: Application[] = [
  {
    id: '1', company: 'Google', role: 'SWE', status: 'APPLIED',
    jobUrl: null, location: 'Remote', salary: null, notes: null,
    appliedAt: null, followUpAt: null,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2', company: 'Meta', role: 'Frontend', status: 'INTERVIEW',
    jobUrl: null, location: 'Tehran', salary: null, notes: null,
    appliedAt: null, followUpAt: null,
    createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z',
  },
]

jest.mock('@/hooks/useApplications', () => ({
  useApplications:  () => ({ data: mockApplications, isLoading: false, isError: false }),
  useMoveApplication: () => ({ mutate: jest.fn() }),
}))

describe('KanbanBoard', () => {
  it('renders all six column headers', () => {
    render(<KanbanBoard />)
    expect(screen.getByText('Wishlist')).toBeInTheDocument()
    expect(screen.getByText('Applied')).toBeInTheDocument()
    expect(screen.getByText('Phone Screen')).toBeInTheDocument()
    expect(screen.getByText('Interview')).toBeInTheDocument()
    expect(screen.getByText('Offer')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders application cards', () => {
    render(<KanbanBoard />)
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
  })

  it('filters cards by search query', () => {
    render(<KanbanBoard />)
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'Google' },
    })
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.queryByText('Meta')).not.toBeInTheDocument()
  })

  it('shows loading spinner when isLoading is true', () => {
    jest.resetModules()
    jest.mock('@/hooks/useApplications', () => ({
      useApplications:    () => ({ data: [], isLoading: true, isError: false }),
      useMoveApplication: () => ({ mutate: jest.fn() }),
    }))
    // Re-import after resetting so the new mock takes effect
    const { KanbanBoard: Board } = require('@/components/kanban/KanbanBoard')
    const { container } = render(<Board />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

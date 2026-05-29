import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobCard } from '@/components/kanban/JobCard'
import type { Application } from '@/types'

// ── Mock heavy dependencies ────────────────────────────────────────────────
// dnd-kit requires a real DOM pointer-events environment.
// We mock useSortable to return no-op drag state so the card renders cleanly.
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))
jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

// Mock TanStack Query hooks — we test the component, not the network layer
jest.mock('@/hooks/useApplications', () => ({
  useDeleteApplication: () => ({ mutate: jest.fn() }),
  useUpdateApplication: () => ({ mutateAsync: jest.fn(), isPending: false }),
  useCreateApplication: () => ({ mutateAsync: jest.fn(), isPending: false }),
}))

// EventTimeline makes fetch calls — stub it out
jest.mock('@/components/kanban/EventTimeline', () => ({
  EventTimeline: () => <div data-testid="event-timeline" />,
}))

const baseApp: Application = {
  id:          'app-1',
  company:     'Acme Corp',
  role:        'Frontend Engineer',
  status:      'APPLIED',
  jobUrl:      'https://acme.com/jobs/1',
  location:    'Tehran, Iran',
  salary:      '$80k',
  notes:       null,
  appliedAt:   '2025-05-01T00:00:00.000Z',
  followUpAt:  null,
  createdAt:   '2025-05-01T00:00:00.000Z',
  updatedAt:   '2025-05-01T00:00:00.000Z',
}

describe('JobCard', () => {
  it('renders company and role', () => {
    render(<JobCard application={baseApp} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument()
  })

  it('renders location and salary', () => {
    render(<JobCard application={baseApp} />)
    expect(screen.getByText(/Tehran, Iran/i)).toBeInTheDocument()
    expect(screen.getByText(/\$80k/i)).toBeInTheDocument()
  })

  it('renders the job URL link', () => {
    render(<JobCard application={baseApp} />)
    // link is hidden until hover — but it's still in the DOM
    const link = screen.getByLabelText(/open posting/i)
    expect(link).toHaveAttribute('href', 'https://acme.com/jobs/1')
  })

  it('does not render URL link when jobUrl is null', () => {
    render(<JobCard application={{ ...baseApp, jobUrl: null }} />)
    expect(screen.queryByLabelText(/open posting/i)).not.toBeInTheDocument()
  })

  it('shows overdue badge when followUpAt is in the past', () => {
    render(<JobCard application={{ ...baseApp, followUpAt: '2020-01-01T00:00:00.000Z' }} />)
    expect(screen.getByText(/overdue/i)).toBeInTheDocument()
  })

  it('expands EventTimeline when Activity button is clicked', async () => {
    render(<JobCard application={baseApp} />)
    expect(screen.queryByTestId('event-timeline')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText(/activity/i))
    await waitFor(() =>
      expect(screen.getByTestId('event-timeline')).toBeInTheDocument()
    )
  })

  it('opens edit dialog when edit button is clicked', () => {
    render(<JobCard application={baseApp} />)
    // AddJobDialog renders a dialog — it's present but closed
    // Clicking the pencil opens it
    const editBtn = screen.getByLabelText(/edit/i)
    fireEvent.click(editBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

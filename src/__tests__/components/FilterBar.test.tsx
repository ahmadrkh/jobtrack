// Component tests for FilterBar using React Testing Library.
//
// RTL philosophy: test what the user sees and does, not implementation details.
// We don't test className values or internal state — we test visible text,
// button clicks, and ARIA attributes.

import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '@/components/layout/FilterBar'
import type { Status } from '@/types'

const noop = () => {}

const defaultProps = {
  search: '',
  onSearchChange: noop,
  statusFilter: 'ALL' as Status | 'ALL',
  onStatusFilterChange: noop,
  totalCount: 10,
  filteredCount: 10,
}

describe('FilterBar', () => {
  it('renders the search input', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search company/i)).toBeInTheDocument()
  })

  it('renders all status pills', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /wishlist/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /applied/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /interview/i })).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', () => {
    const onChange = jest.fn()
    render(<FilterBar {...defaultProps} onSearchChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/search company/i), {
      target: { value: 'Google' },
    })
    expect(onChange).toHaveBeenCalledWith('Google')
  })

  it('calls onStatusFilterChange when a pill is clicked', () => {
    const onFilter = jest.fn()
    render(<FilterBar {...defaultProps} onStatusFilterChange={onFilter} />)
    fireEvent.click(screen.getByRole('button', { name: /applied/i }))
    expect(onFilter).toHaveBeenCalledWith('APPLIED')
  })

  it('shows count when filter is active', () => {
    render(
      <FilterBar
        {...defaultProps}
        search="google"
        filteredCount={3}
        totalCount={10}
      />
    )
    expect(screen.getByText(/3 of 10/i)).toBeInTheDocument()
  })

  it('hides count when no filter is active', () => {
    render(<FilterBar {...defaultProps} search="" statusFilter="ALL" />)
    expect(screen.queryByText(/of 10/i)).not.toBeInTheDocument()
  })

  it('shows clear button when search has value', () => {
    render(<FilterBar {...defaultProps} search="test" />)
    expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument()
  })

  it('calls onSearchChange with empty string when clear is clicked', () => {
    const onChange = jest.fn()
    render(<FilterBar {...defaultProps} search="test" onSearchChange={onChange} />)
    fireEvent.click(screen.getByLabelText(/clear search/i))
    expect(onChange).toHaveBeenCalledWith('')
  })
})

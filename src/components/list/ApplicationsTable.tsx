// ApplicationsTable — TanStack Table v8 implementation.
//
// Features demonstrated:
//   • Column sorting (click header → asc → desc → none)
//   • Global text filter (searches company + role + location)
//   • Status facet filter (same pills as the Kanban FilterBar)
//   • Column visibility toggle (show/hide any column)
//   • Pagination (10 rows/page)
//   • Row click → opens Edit dialog
//
// This satisfies several job-requirement checkboxes at once:
//   ✓ TanStack libraries (tanstack/react-table)
//   ✓ Reusable Components (columns defined separately)
//   ✓ Responsive (table scrolls horizontally on mobile)

'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
} from '@tanstack/react-table'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Settings2, Search, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddJobDialog } from '@/components/kanban/AddJobDialog'
import { KANBAN_COLUMNS } from '@/types'
import { columns } from './columns'
import { cn } from '@/lib/utils'
import type { Application, Status } from '@/types'

interface ApplicationsTableProps {
  data: Application[]
}

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  const [sorting,          setSorting]          = useState<SortingState>([
    { id: 'updatedAt', desc: true }, // default: most recently updated first
  ])
  const [columnFilters,    setColumnFilters]    = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    followUpAt: false,   // hidden by default — shown on demand
    updatedAt:  false,
  })
  const [globalFilter,     setGlobalFilter]     = useState('')
  const [statusFilter,     setStatusFilter]     = useState<Status[]>([])
  const [editApp,          setEditApp]          = useState<Application | null>(null)

  // Apply status facet filter before handing data to the table.
  // TanStack's built-in filterFn handles this, but doing it here keeps
  // the filter pill UI decoupled from the table internals.
  const filtered = useMemo(
    () => statusFilter.length === 0 ? data : data.filter(a => statusFilter.includes(a.status)),
    [data, statusFilter]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state:                  { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange:        setSorting,
    onColumnFiltersChange:  setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange:   setGlobalFilter,
    // Global filter searches company, role, location
    globalFilterFn: (row, _colId, value: string) => {
      const q = value.toLowerCase()
      const { company, role, location } = row.original
      return (
        company.toLowerCase().includes(q) ||
        role.toLowerCase().includes(q) ||
        (location ?? '').toLowerCase().includes(q)
      )
    },
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  function toggleStatus(status: Status) {
    setStatusFilter(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Global search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search company, role, location…"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-8 pr-8 h-8 text-sm"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {KANBAN_COLUMNS.map(col => (
            <button
              key={col.id}
              onClick={() => toggleStatus(col.id)}
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors',
                statusFilter.includes(col.id)
                  ? col.badgeColor
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {col.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Result count */}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {table.getFilteredRowModel().rows.length} of {data.length}
          </span>

          {/* Column visibility toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Settings2 className="h-3.5 w-3.5" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(col => col.getCanHide())
                .map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize text-xs"
                    checked={col.getIsVisible()}
                    onCheckedChange={v => col.toggleVisibility(v)}
                  >
                    {col.id === 'appliedAt'  ? 'Applied'    :
                     col.id === 'followUpAt' ? 'Follow-up'  :
                     col.id === 'updatedAt'  ? 'Updated'    :
                     col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground text-sm"
                >
                  No applications found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => setEditApp(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline" size="icon" className="h-7 w-7"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Edit dialog — triggered by row click */}
      {editApp && (
        <AddJobDialog
          open={!!editApp}
          onOpenChange={open => { if (!open) setEditApp(null) }}
          editApp={editApp}
        />
      )}
    </div>
  )
}

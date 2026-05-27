'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createApplicationSchema, CreateApplicationInput } from '@/lib/validations'
import { Application } from '@/types'
import { KANBAN_COLUMNS } from '@/types'

interface ApplicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (app: Application) => void
  // When editApp is provided the form switches to edit mode:
  // - title becomes "Edit Application"
  // - fields are pre-filled with the current values
  // - submit fires PATCH instead of POST
  editApp?: Application
}

export function ApplicationForm({ open, onOpenChange, onSuccess, editApp }: ApplicationFormProps) {
  const isEdit = Boolean(editApp)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: { status: 'WISHLIST' },
  })

  // react-hook-form's defaultValues only apply on first render.
  // When the user opens the edit modal for a *different* card we need
  // to imperatively reset the form with the new card's values.
  // useEffect with [editApp] runs whenever editApp changes.
  useEffect(() => {
    if (editApp) {
      reset({
        company:  editApp.company,
        role:     editApp.role,
        status:   editApp.status as CreateApplicationInput['status'],
        jobUrl:   editApp.jobUrl   ?? '',
        location: editApp.location ?? '',
        salary:   editApp.salary   ?? '',
        notes:    editApp.notes    ?? '',
      })
    } else {
      reset({ status: 'WISHLIST' })
    }
  }, [editApp, reset])

  async function onSubmit(data: CreateApplicationInput) {
    if (isEdit && editApp) {
      // PATCH — update the existing application
      const res = await fetch(`/api/applications/${editApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return
      const updated: Application = await res.json()
      onSuccess(updated)
    } else {
      // POST — create a new application
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) return
      const app: Application = await res.json()
      onSuccess(app)
      reset()
    }
  }

  if (!open) return null

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Application' : 'Add Application'}
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
              <input
                {...register('company')}
                placeholder="e.g. Digikala"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <input
                {...register('role')}
                placeholder="e.g. Frontend Developer"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {KANBAN_COLUMNS.map(col => (
                <option key={col.id} value={col.id}>{col.label}</option>
              ))}
            </select>
          </div>

          {/* Location + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                {...register('location')}
                placeholder="e.g. Tehran / Remote"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
              <input
                {...register('salary')}
                placeholder="e.g. 150M Toman"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Job URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job URL</label>
            <input
              {...register('jobUrl')}
              placeholder="https://..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.jobUrl && <p className="text-red-500 text-xs mt-1">{errors.jobUrl.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Anything worth remembering..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => { onOpenChange(false); reset() }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

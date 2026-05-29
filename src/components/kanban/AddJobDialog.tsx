'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCreateApplication, useUpdateApplication } from '@/hooks/useApplications'
import { KANBAN_COLUMNS } from '@/types'
import type { Application } from '@/types'

const schema = z.object({
  company:    z.string().min(1, 'Company is required'),
  role:       z.string().min(1, 'Role is required'),
  status:     z.string().min(1),
  jobUrl:     z.string().url('Must be a valid URL').or(z.literal('')),
  location:   z.string(),
  salary:     z.string(),
  appliedAt:  z.string(),
  followUpAt: z.string(),   // "YYYY-MM-DD" or ""
  notes:      z.string(),
})

type FormValues = z.infer<typeof schema>

interface AddJobDialogProps {
  open:         boolean
  onOpenChange: (open: boolean) => void
  editApp?:     Application
}

export function AddJobDialog({ open, onOpenChange, editApp }: AddJobDialogProps) {
  const createApp = useCreateApplication()
  const updateApp = useUpdateApplication()
  const isEdit    = !!editApp

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        company:    editApp?.company    ?? '',
        role:       editApp?.role       ?? '',
        status:     editApp?.status     ?? 'WISHLIST',
        jobUrl:     editApp?.jobUrl     ?? '',
        location:   editApp?.location   ?? '',
        salary:     editApp?.salary     ?? '',
        appliedAt:  editApp?.appliedAt?.slice(0, 10)  ?? '',
        followUpAt: editApp?.followUpAt?.slice(0, 10) ?? '',
        notes:      editApp?.notes      ?? '',
      },
    })

  const statusValue = watch('status')

  async function onSubmit(values: FormValues) {
    const payload = {
      company:    values.company,
      role:       values.role,
      status:     values.status as Application['status'],
      jobUrl:     values.jobUrl     || null,
      location:   values.location   || null,
      salary:     values.salary     || null,
      appliedAt:  values.appliedAt  ? new Date(values.appliedAt).toISOString()  : null,
      followUpAt: values.followUpAt ? new Date(values.followUpAt).toISOString() : null,
      notes:      values.notes      || null,
    }

    if (isEdit) {
      await updateApp.mutateAsync({ id: editApp.id, ...payload })
    } else {
      await createApp.mutateAsync(payload)
    }
    reset()
    onOpenChange(false)
  }

  const isPending = createApp.isPending || updateApp.isPending

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Application' : 'Add Application'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">

          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" placeholder="Acme Corp" {...register('company')} />
              {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" placeholder="Frontend Engineer" {...register('role')} />
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={statusValue} onValueChange={v => setValue('status', v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                {KANBAN_COLUMNS.map(col => (
                  <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job URL */}
          <div className="space-y-1.5">
            <Label htmlFor="jobUrl">Job URL</Label>
            <Input id="jobUrl" type="url" placeholder="https://…" {...register('jobUrl')} />
            {errors.jobUrl && <p className="text-xs text-destructive">{errors.jobUrl.message}</p>}
          </div>

          {/* Location + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Remote / Tehran" {...register('location')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" placeholder="$80k – $100k" {...register('salary')} />
            </div>
          </div>

          {/* Applied + Follow-up dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="appliedAt">Applied Date</Label>
              <Input id="appliedAt" type="date" {...register('appliedAt')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="followUpAt" className="flex items-center gap-1.5">
                Follow-up Date
                <span className="text-xs text-muted-foreground font-normal">(reminder)</span>
              </Label>
              <Input id="followUpAt" type="date" {...register('followUpAt')} />
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Recruiter name, interview notes, next steps…"
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

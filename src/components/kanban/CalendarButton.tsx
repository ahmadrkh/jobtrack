'use client'

// Shown on job cards when status === 'INTERVIEW'.
// Lets the user add the interview to Google Calendar or download an ICS file.

import { useState } from 'react'
import { CalendarPlus, ExternalLink, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { googleCalendarUrl, downloadIcs, interviewEvent } from '@/lib/calendar'

interface Props {
  company:  string
  role:     string
  location: string | null
}

export function CalendarButton({ company, role, location }: Props) {
  const [open,     setOpen]     = useState(false)
  const [dateTime, setDateTime] = useState('')  // datetime-local input

  function buildEvent() {
    return interviewEvent({
      company,
      role,
      location,
      dateIso: dateTime ? new Date(dateTime).toISOString() : undefined,
    })
  }

  function openGoogleCalendar() {
    window.open(googleCalendarUrl(buildEvent()), '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  function downloadIcsFile() {
    downloadIcs(buildEvent())
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-cyan-600 border-cyan-200 hover:bg-cyan-50 dark:text-cyan-400 dark:border-cyan-800 dark:hover:bg-cyan-950/30"
        onClick={() => setOpen(true)}
      >
        <CalendarPlus className="h-3.5 w-3.5" />
        <span className="text-xs">Add to Calendar</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              <p className="font-medium">{company}</p>
              <p className="text-muted-foreground text-xs">{role}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interview-dt">Date &amp; Time <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="interview-dt"
                type="datetime-local"
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use next business day at 10:00.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="gap-1.5 flex-1"
              onClick={downloadIcsFile}
            >
              <Download className="h-4 w-4" />
              Download .ics
            </Button>
            <Button
              className="gap-1.5 flex-1"
              onClick={openGoogleCalendar}
            >
              <ExternalLink className="h-4 w-4" />
              Google Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

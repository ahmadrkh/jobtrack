// Calendar utilities — no external dependencies.
// Two strategies:
//   1. Google Calendar URL   — opens google.com/calendar/render with pre-filled fields
//   2. ICS file download     — universal, works with Apple Calendar, Outlook, etc.

export interface CalendarEvent {
  title:       string   // e.g. "Interview — Acme Corp"
  description: string
  location?:   string
  startIso:    string   // ISO 8601: "2025-06-15T10:00:00"
  durationMin: number   // default 60
}

// ── Google Calendar URL ────────────────────────────────────────────────────────

function toGCalDate(iso: string, durationMin: number): { start: string; end: string } {
  const start = new Date(iso)
  const end   = new Date(start.getTime() + durationMin * 60_000)
  const fmt   = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return { start: fmt(start), end: fmt(end) }
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const { start, end } = toGCalDate(event.startIso, event.durationMin)
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     event.title,
    dates:    `${start}/${end}`,
    details:  event.description,
    ...(event.location ? { location: event.location } : {}),
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

// ── ICS file ──────────────────────────────────────────────────────────────────

function icsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z')
}

function uid(): string {
  return `jobtrack-${Date.now()}-${Math.random().toString(36).slice(2)}@jobtrack`
}

export function generateIcs(event: CalendarEvent): string {
  const start = icsDate(event.startIso)
  const end   = icsDate(
    new Date(new Date(event.startIso).getTime() + event.durationMin * 60_000).toISOString(),
  )
  const now   = icsDate(new Date().toISOString())

  // Fold long lines at 75 chars (RFC 5545)
  const fold = (s: string) =>
    s.match(/.{1,75}/g)?.join('\r\n ') ?? s

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobTrack//JobTrack//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid()}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${fold(event.title)}`,
    `DESCRIPTION:${fold(event.description)}`,
    ...(event.location ? [`LOCATION:${fold(event.location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadIcs(event: CalendarEvent): void {
  const blob = new Blob([generateIcs(event)], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Convenience builder for interview events ──────────────────────────────────

export function interviewEvent(opts: {
  company:  string
  role:     string
  location: string | null
  dateIso?: string       // if null, defaults to next business day at 10:00
}): CalendarEvent {
  let startIso = opts.dateIso
  if (!startIso) {
    const d = new Date()
    // Jump to next weekday
    d.setDate(d.getDate() + (d.getDay() === 5 ? 3 : d.getDay() === 6 ? 2 : 1))
    d.setHours(10, 0, 0, 0)
    startIso = d.toISOString()
  }

  return {
    title:       `Interview — ${opts.company}`,
    description: `Role: ${opts.role}\n\nAdded via JobTrack`,
    location:    opts.location ?? undefined,
    startIso,
    durationMin: 60,
  }
}

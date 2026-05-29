// Vercel Cron Job handler — runs daily at 08:00 UTC (configured in vercel.json).
//
// Security: Vercel sets Authorization: "Bearer <CRON_SECRET>" on every cron
// invocation. We reject requests without it so the endpoint can't be triggered
// by strangers. Generate with: openssl rand -base64 32

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'

const TERMINAL_STATUSES = ['OFFER', 'REJECTED']
const DAYS_STALE = 7

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now       = new Date()
  const staleDate = new Date(now.getTime() - DAYS_STALE * 24 * 60 * 60 * 1000)

  // Fetch all overdue applications that haven't moved recently
  const due = await prisma.application.findMany({
    where: {
      followUpAt: { lte: now },
      status:     { notIn: TERMINAL_STATUSES },
      updatedAt:  { lte: staleDate },
    },
    include: { user: { select: { email: true, name: true } } },
  })

  const results: { id: string; status: 'sent' | 'skipped'; reason?: string }[] = []

  for (const app of due) {
    if (!app.user.email) {
      results.push({ id: app.id, status: 'skipped', reason: 'no email' })
      continue
    }

    const daysSinceUpdate = Math.floor(
      (now.getTime() - app.updatedAt.getTime()) / (24 * 60 * 60 * 1000)
    )

    try {
      await sendReminderEmail({
        to: app.user.email,
        name: app.user.name,
        company: app.company,
        role: app.role,
        status: app.status,
        daysSinceUpdate,
      })

      // Clear followUpAt after sending so we don't re-send tomorrow
      await prisma.application.update({
        where: { id: app.id },
        data:  { followUpAt: null },
      })

      results.push({ id: app.id, status: 'sent' })
    } catch (err) {
      console.error(`[cron/reminders] Failed for app ${app.id}:`, err)
      results.push({ id: app.id, status: 'skipped', reason: 'send failed' })
    }
  }

  console.log(`[cron/reminders] Processed ${due.length}:`, results)

  return NextResponse.json({
    processed: due.length,
    sent:      results.filter(r => r.status === 'sent').length,
    skipped:   results.filter(r => r.status === 'skipped').length,
  })
}

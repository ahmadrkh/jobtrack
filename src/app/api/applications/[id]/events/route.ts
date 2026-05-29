import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth'

const noteSchema = z.object({
  content: z.string().min(1).max(500),
})

// Verify the application belongs to the current user before touching events
async function getOwnedApp(id: string, userId: string) {
  const app = await prisma.application.findUnique({ where: { id } })
  if (!app || app.userId !== userId) return null
  return app
}

// GET /api/applications/[id]/events
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    if (!await getOwnedApp(params.id, session.user.id))
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const events = await prisma.event.findMany({
      where:   { applicationId: params.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(events)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/applications/[id]/events
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    if (!await getOwnedApp(params.id, session.user.id))
      return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body   = await req.json()
    const result = noteSchema.safeParse(body)
    if (!result.success)
      return NextResponse.json({ error: 'Invalid note' }, { status: 400 })

    const event = await prisma.event.create({
      data: {
        applicationId: params.id,
        type:    'NOTE',
        content: result.data.content,
      },
    })
    return NextResponse.json(event, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

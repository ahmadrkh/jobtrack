import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createEventSchema = z.object({
  content: z.string().min(1).max(500),
})

// GET /api/applications/[id]/events
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const events = await prisma.event.findMany({
    where: { applicationId: params.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(events)
}

// POST /api/applications/[id]/events  — add a manual note
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify the application exists
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  })
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const body = await req.json()
  const result = createEventSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: {
      applicationId: params.id,
      type: 'NOTE',
      content: result.data.content,
    },
  })

  return NextResponse.json(event, { status: 201 })
}

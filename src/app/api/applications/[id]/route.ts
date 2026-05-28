import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { updateApplicationSchema } from '@/lib/validations'

const STATUS_LABELS: Record<string, string> = {
  WISHLIST:     'Wishlist',
  APPLIED:      'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW:    'Interview',
  OFFER:        'Offer',
  REJECTED:     'Rejected',
}

// GET /api/applications/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const application = await prisma.application.findUnique({
    where: { id: params.id },
  })
  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(application)
}

// PATCH /api/applications/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.application.findUnique({
    where: { id: params.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const result = updateApplicationSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: result.data,
  })

  // Auto-log a STATUS_CHANGE event whenever the status field changes
  if (result.data.status && result.data.status !== existing.status) {
    await prisma.event.create({
      data: {
        applicationId: params.id,
        type: 'STATUS_CHANGE',
        content: `Moved from ${STATUS_LABELS[existing.status] ?? existing.status} to ${STATUS_LABELS[result.data.status] ?? result.data.status}`,
      },
    })
  }

  return NextResponse.json(updated)
}

// DELETE /api/applications/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.application.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { updateApplicationSchema } from '@/lib/validations'
import { requireSession } from '@/lib/auth'

const STATUS_LABELS: Record<string, string> = {
  WISHLIST: 'Wishlist', APPLIED: 'Applied', PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview', OFFER: 'Offer', REJECTED: 'Rejected',
}

// Shared ownership check — throws or returns 404 if the application
// doesn't belong to the current user. This prevents IDOR attacks
// (Insecure Direct Object Reference) where a user guesses another
// user's application ID and reads / deletes their data.
async function getOwnedApplication(id: string, userId: string) {
  const app = await prisma.application.findUnique({ where: { id } })
  if (!app)                   return null
  if (app.userId !== userId)  return null   // treat as not-found (don't leak existence)
  return app
}

// GET /api/applications/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const app = await getOwnedApplication(params.id, session.user.id)
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(app)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/applications/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session  = await requireSession()
    const existing = await getOwnedApplication(params.id, session.user.id)
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body   = await req.json()
    const result = updateApplicationSchema.safeParse(body)
    if (!result.success)
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...result.data,
        appliedAt: result.data.appliedAt ? new Date(result.data.appliedAt) : undefined,
      },
    })

    // Auto-log a STATUS_CHANGE event when the status field changes
    if (result.data.status && result.data.status !== existing.status) {
      await prisma.event.create({
        data: {
          applicationId: params.id,
          type:    'STATUS_CHANGE',
          content: `Moved from ${STATUS_LABELS[existing.status] ?? existing.status} to ${STATUS_LABELS[result.data.status] ?? result.data.status}`,
        },
      })
    }

    return NextResponse.json(updated)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[PATCH /api/applications/[id]]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/applications/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession()
    const app = await getOwnedApplication(params.id, session.user.id)
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.application.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

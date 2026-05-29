import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApplicationSchema } from '@/lib/validations'
import { requireSession } from '@/lib/auth'

// GET /api/applications
// Returns only the signed-in user's applications.
export async function GET() {
  try {
    const session = await requireSession()
    const applications = await prisma.application.findMany({
      where:   { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(applications)
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[GET /api/applications]', e)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

// POST /api/applications
export async function POST(request: Request) {
  try {
    const session = await requireSession()
    const body = await request.json()

    const result = createApplicationSchema.safeParse(body)
    if (!result.success)
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )

    const application = await prisma.application.create({
      data: {
        ...result.data,
        jobUrl:    result.data.jobUrl    || null,
        appliedAt: result.data.appliedAt ? new Date(result.data.appliedAt) : null,
        // Tie the new application to the authenticated user
        userId:    session.user.id,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (e: any) {
    if (e.message === 'UNAUTHORIZED')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('[POST /api/applications]', e)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateApplicationSchema } from '@/lib/validations'

type RouteContext = { params: { id: string } }

// GET /api/applications/:id
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
    })
    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(application)
  } catch (error) {
    console.error('[GET /api/applications/:id]', error)
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 })
  }
}

// PATCH /api/applications/:id
// Partial update — only the fields sent in the body are changed
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const body = await request.json()
    const result = updateApplicationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const application = await prisma.application.update({
      where: { id: params.id },
      data: {
        ...result.data,
        jobUrl:    result.data.jobUrl !== undefined ? (result.data.jobUrl || null) : undefined,
        appliedAt: result.data.appliedAt !== undefined
          ? (result.data.appliedAt ? new Date(result.data.appliedAt) : null)
          : undefined,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('[PATCH /api/applications/:id]', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}

// DELETE /api/applications/:id
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    await prisma.application.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/applications/:id]', error)
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
  }
}

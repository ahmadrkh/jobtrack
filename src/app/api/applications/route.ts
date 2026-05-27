import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createApplicationSchema } from '@/lib/validations'

// GET /api/applications
// Returns all applications ordered by most recently updated
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json(applications)
  } catch (error) {
    console.error('[GET /api/applications]', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

// POST /api/applications
// Creates a new application after validating the body with Zod
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Zod validation — returns a discriminated union { success, data } | { success, error }
    const result = createApplicationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        ...result.data,
        // Convert empty string → null for optional URL / date fields
        jobUrl:    result.data.jobUrl    || null,
        appliedAt: result.data.appliedAt ? new Date(result.data.appliedAt) : null,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('[POST /api/applications]', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}

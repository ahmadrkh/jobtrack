// Shared "Try the demo" account. The `demo` credentials provider (see lib/auth.ts)
// signs every visitor into this one user, so people can explore a populated board
// without creating an account. Data is shared across visitors by design.

import { prisma } from '@/lib/prisma'

export const DEMO_EMAIL = 'demo@jobtrack.app'

// Spread across every stage so the board, list, stats, and map all look alive.
const DEMO_APPLICATIONS = [
  { company: 'Stripe',    role: 'Frontend Engineer',     status: 'OFFER',        location: 'San Francisco, CA', salary: '$160k–$190k' },
  { company: 'Figma',     role: 'Product Engineer',      status: 'INTERVIEW',    location: 'New York, NY',      salary: '$150k–$180k' },
  { company: 'Anthropic', role: 'Software Engineer',     status: 'PHONE_SCREEN', location: 'San Francisco, CA', salary: '$170k–$210k' },
  { company: 'Vercel',    role: 'Developer Experience',  status: 'APPLIED',      location: 'Remote',            salary: '$140k–$170k' },
  { company: 'Linear',    role: 'Fullstack Engineer',    status: 'APPLIED',      location: 'Remote',            salary: '$145k–$175k' },
  { company: 'Notion',    role: 'Frontend Engineer',     status: 'WISHLIST',     location: 'San Francisco, CA', salary: '$150k–$185k' },
  { company: 'Supabase',  role: 'Developer Advocate',    status: 'WISHLIST',     location: 'Remote',            salary: '$130k–$160k' },
  { company: 'Retool',    role: 'Software Engineer',     status: 'REJECTED',     location: 'San Francisco, CA', salary: '$150k–$180k' },
] as const

/**
 * Idempotently seed the demo board. Called on every demo login but only writes
 * when the board is empty — so it self-heals if a visitor clears it out, without
 * piling up duplicate rows on each sign-in.
 */
export async function ensureDemoSeeded(userId: string) {
  const count = await prisma.application.count({ where: { userId } })
  if (count > 0) return

  const DAY = 24 * 60 * 60 * 1000
  const now = Date.now()

  await prisma.application.createMany({
    data: DEMO_APPLICATIONS.map((a, i) => ({
      company:   a.company,
      role:      a.role,
      status:    a.status,
      location:  a.location,
      salary:    a.salary,
      userId,
      appliedAt: a.status === 'WISHLIST' ? null : new Date(now - (i + 2) * DAY),
      createdAt: new Date(now - (i + 4) * DAY),
    })),
  })
}

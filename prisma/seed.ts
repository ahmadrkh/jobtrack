// prisma/seed.ts — seeds the database with realistic demo job applications.
//
// Run with:
//   npx tsx prisma/seed.ts
//
// Finds the FIRST user in the database (you, after logging in once)
// and creates applications for that user.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const APPLICATIONS = [
  // ── WISHLIST ──
  { company: 'Stripe',     role: 'Senior Frontend Engineer',           status: 'WISHLIST',      location: 'San Francisco, CA',  salary: '$180k–$220k',     jobUrl: 'https://stripe.com/jobs',          notes: 'Dream company. Strong fintech focus. Review engineering blog first.',              appliedDaysAgo: 0,  followUpDays: null },
  { company: 'Figma',      role: 'Engineer — Design Systems',          status: 'WISHLIST',      location: 'Remote',             salary: '$160k–$200k',     jobUrl: 'https://figma.com/careers',        notes: 'Perfect fit for UI/UX background. React + TypeScript heavy.',                      appliedDaysAgo: 0,  followUpDays: null },
  { company: 'Linear',     role: 'Full Stack Engineer',                status: 'WISHLIST',      location: 'Remote',             salary: '$150k–$190k',     jobUrl: 'https://linear.app/careers',       notes: 'Small team, high impact. They use Next.js + Prisma — my exact stack.',             appliedDaysAgo: 0,  followUpDays: null },

  // ── APPLIED ──
  { company: 'Vercel',     role: 'Software Engineer — Next.js',        status: 'APPLIED',       location: 'Remote',             salary: '$160k–$200k',     jobUrl: 'https://vercel.com/careers',       notes: 'Applied via website. Hiring manager is Lee Robinson.',                             appliedDaysAgo: 12, followUpDays: null },
  { company: 'Shopify',    role: 'Senior React Developer',             status: 'APPLIED',       location: 'Toronto, Canada',    salary: 'CAD $150k–$185k', jobUrl: 'https://shopify.com/careers',      notes: 'Referred by Sarah Chen on the Checkout team.',                                    appliedDaysAgo: 8,  followUpDays: null },
  { company: 'Notion',     role: 'Frontend Engineer',                  status: 'APPLIED',       location: 'New York, NY',       salary: '$155k–$195k',     jobUrl: 'https://notion.so/careers',        notes: 'Tailored cover letter mentioning their block-based editor.',                       appliedDaysAgo: 15, followUpDays: null },
  { company: 'GitHub',     role: 'Software Engineer — Copilot',        status: 'APPLIED',       location: 'Remote',             salary: '$170k–$210k',     jobUrl: 'https://github.com/about/careers', notes: 'Role is on the AI/Copilot product team.',                                         appliedDaysAgo: 20, followUpDays: null },

  // ── PHONE SCREEN ──
  { company: 'Airbnb',     role: 'Senior Software Engineer',           status: 'PHONE_SCREEN',  location: 'San Francisco, CA',  salary: '$185k–$230k',     jobUrl: 'https://careers.airbnb.com',       notes: 'Recruiter reached out on LinkedIn. Phone screen with Priya on Thursday.',           appliedDaysAgo: 25, followUpDays: 3  },
  { company: 'Loom',       role: 'Frontend Engineer',                  status: 'PHONE_SCREEN',  location: 'Remote',             salary: '$140k–$175k',     jobUrl: 'https://loom.com/careers',         notes: '30-min call with engineering manager next week.',                                  appliedDaysAgo: 18, followUpDays: null },
  { company: 'Clerk',      role: 'Developer Experience Engineer',      status: 'PHONE_SCREEN',  location: 'Remote',             salary: '$130k–$160k',     jobUrl: 'https://clerk.com/careers',        notes: 'Auth-focused startup. Call with CTO on Monday.',                                  appliedDaysAgo: 14, followUpDays: 2  },

  // ── INTERVIEW ──
  { company: 'Anthropic',  role: 'Software Engineer — Developer Tools', status: 'INTERVIEW',    location: 'San Francisco, CA',  salary: '$200k–$280k',     jobUrl: 'https://anthropic.com/careers',    notes: 'Round 2 — system design. Topic: distributed rate limiting. Prep DynamoDB patterns.', appliedDaysAgo: 30, followUpDays: 5  },
  { company: 'Supabase',   role: 'Senior Full Stack Engineer',          status: 'INTERVIEW',    location: 'Remote',             salary: '$140k–$180k',     jobUrl: 'https://supabase.com/careers',     notes: 'Take-home was positive. Final interview with team lead next Friday.',               appliedDaysAgo: 22, followUpDays: 7  },
  { company: 'Planetscale','role': 'Frontend Engineer',                 status: 'INTERVIEW',    location: 'Remote',             salary: '$150k–$185k',     jobUrl: 'https://planetscale.com/careers',  notes: '3rd round — behavioural + culture fit. They loved the portfolio.',                  appliedDaysAgo: 28, followUpDays: null },

  // ── OFFER ──
  { company: 'Resend',     role: 'Software Engineer',                  status: 'OFFER',         location: 'Remote',             salary: '$145k + equity',  jobUrl: 'https://resend.com/careers',       notes: 'Offer received! Deadline next Friday. TC $145k + 0.1% equity.',                   appliedDaysAgo: 35, followUpDays: 5  },

  // ── REJECTED ──
  { company: 'Google',     role: 'Software Engineer L4',               status: 'REJECTED',      location: 'Mountain View, CA',  salary: '$180k–$250k',     jobUrl: 'https://careers.google.com',       notes: 'Failed system design round. Need stronger distributed systems knowledge.',          appliedDaysAgo: 45, followUpDays: null },
  { company: 'Meta',       role: 'Frontend Engineer E4',               status: 'REJECTED',      location: 'Menlo Park, CA',     salary: '$185k–$260k',     jobUrl: 'https://metacareers.com',          notes: 'Coding fine but no headcount. Recruiter: try again in 6 months.',                  appliedDaysAgo: 50, followUpDays: null },
]

function daysAgo(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() - n); return d
}
function daysFromNow(n: number): Date {
  const d = new Date(); d.setDate(d.getDate() + n); return d
}

async function main() {
  console.log('🌱 Seeding JobTrack demo data...\n')

  const user = await prisma.user.findFirst({ orderBy: { id: 'asc' } })
  if (!user) {
    console.error('❌ No user found. Log in via GitHub OAuth first, then re-run.')
    process.exit(1)
  }
  console.log(`✓ Found user: ${user.name ?? user.email}`)

  const existing = await prisma.application.count({ where: { userId: user.id } })
  if (existing > 0) {
    console.log(`\n⚠️  User already has ${existing} applications. Skipping seed.`)
    console.log('   To reset: delete from Prisma Studio, then re-run.\n')
    process.exit(0)
  }

  let created = 0
  for (const app of APPLICATIONS) {
    const { appliedDaysAgo, followUpDays, role, ...rest } = app
    const record = await prisma.application.create({
      data: {
        ...rest,
        role,
        userId:     user.id,
        appliedAt:  appliedDaysAgo ? daysAgo(appliedDaysAgo) : null,
        followUpAt: followUpDays   ? daysFromNow(followUpDays) : null,
        createdAt:  daysAgo(appliedDaysAgo || 0),
      },
    })

    await prisma.event.create({
      data: { applicationId: record.id, type: 'CREATED',
        content: 'Application added', createdAt: daysAgo(appliedDaysAgo || 0) },
    })

    if (['PHONE_SCREEN','INTERVIEW','OFFER','REJECTED'].includes(rest.status)) {
      await prisma.event.create({
        data: { applicationId: record.id, type: 'STATUS_CHANGE',
          content: `Status changed to ${rest.status.replace(/_/g, ' ')}`,
          createdAt: daysAgo(Math.max(0, (appliedDaysAgo || 0) - 7)) },
      })
    }

    console.log(`  ✓ [${rest.status.padEnd(12)}] ${rest.company} — ${role}`)
    created++
  }

  console.log(`\n✅ Created ${created} applications.`)
  const counts = APPLICATIONS.reduce((a, c) => ({ ...a, [c.status]: (a[c.status]||0)+1 }), {} as any)
  Object.entries(counts).forEach(([s, n]) => console.log(`   ${s.padEnd(14)} ${n}`))
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

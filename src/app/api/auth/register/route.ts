// POST /api/auth/register — create a new email + username + password account.
// This sits alongside the NextAuth catch-all ([...nextauth]); the static
// `register` segment takes precedence over the dynamic route, so there's no
// conflict. The middleware allows everything under /api/auth through
// unauthenticated, so no session is required to reach this.

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-z0-9_]{3,20}$/

export async function POST(req: Request) {
  let body: { email?: string; username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email    = body.email?.trim().toLowerCase()
  const username = body.username?.trim().toLowerCase()
  const password = body.password ?? ''

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (!username || !USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3–20 characters: letters, numbers, or underscore.' },
      { status: 400 },
    )
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  // Reject duplicates on either identifier.
  const existing = await prisma.user.findFirst({
    where:  { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  })
  if (existing) {
    const field = existing.email === email ? 'email' : 'username'
    return NextResponse.json({ error: `That ${field} is already taken.` }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, username, password: hashed, name: username },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}

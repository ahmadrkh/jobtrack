// Central NextAuth configuration.
// Imported by the route handler (app/api/auth/[...nextauth]/route.ts) and any
// server component / API route that needs the session.

import { getServerSession, type NextAuthOptions } from 'next-auth'
import GitHubProvider      from 'next-auth/providers/github'
import GoogleProvider      from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter }   from '@auth/prisma-adapter'
import bcrypt              from 'bcryptjs'
import type { Adapter }    from 'next-auth/adapters'
import { prisma }          from '@/lib/prisma'
import { DEMO_EMAIL, ensureDemoSeeded } from '@/lib/demo'

export const authOptions: NextAuthOptions = {
  // The adapter still persists users and linked OAuth accounts to Postgres.
  // Sessions, however, are JWT-based (see `session.strategy`). That switch is
  // REQUIRED for the Credentials providers — NextAuth v4 cannot use Credentials
  // with database sessions — and it's also what lets the Edge middleware read
  // the session token via getToken() to protect routes.
  adapter: PrismaAdapter(prisma) as Adapter,

  session: { strategy: 'jwt' },

  providers: [
    GitHubProvider({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Email-or-username + password sign-in.
    CredentialsProvider({
      id:   'credentials',
      name: 'Email or username',
      credentials: {
        identifier: { label: 'Email or username', type: 'text' },
        password:   { label: 'Password',          type: 'password' },
      },
      async authorize(creds) {
        const identifier = creds?.identifier?.trim().toLowerCase()
        const password   = creds?.password
        if (!identifier || !password) return null

        const user = await prisma.user.findFirst({
          where: { OR: [{ email: identifier }, { username: identifier }] },
        })
        // OAuth-only users have no password hash — reject them here.
        if (!user?.password) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),

    // One-click shared demo account — no credentials required.
    CredentialsProvider({
      id:   'demo',
      name: 'Demo',
      credentials: {},
      async authorize() {
        const demo = await prisma.user.upsert({
          where:  { email: DEMO_EMAIL },
          update: {},
          create: { email: DEMO_EMAIL, name: 'Demo User', username: 'demo' },
        })
        await ensureDemoSeeded(demo.id)
        return { id: demo.id, name: demo.name, email: demo.email, image: demo.image }
      },
    }),
  ],

  callbacks: {
    // Persist the user id onto the JWT the first time it's issued (sign-in).
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    // Expose it on the session for server components and client hooks.
    session({ session, token }) {
      if (session.user) session.user.id = token.id
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
}

// Convenience re-export — call this in any server component or API route.
// Returns null when no session exists (unauthenticated).
export const getSession = () => getServerSession(authOptions)

// Throws a 401-ready error if no session. Use inside API routes.
export async function requireSession() {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

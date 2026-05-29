// Central NextAuth configuration.
// Imported by both the route handler (app/api/auth/[...nextauth]/route.ts)
// and any server component / API route that needs the session.

import { getServerSession, type NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  // PrismaAdapter persists sessions, accounts, and users to the database.
  // It implements the full Adapter interface so NextAuth can create/read
  // sessions without you writing any SQL.
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    GitHubProvider({
      clientId:     process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  // Extend the default session object so the user's id is available
  // in both server components (getServerSession) and client hooks (useSession).
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
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

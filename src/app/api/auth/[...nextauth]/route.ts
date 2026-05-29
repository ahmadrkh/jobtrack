// This single file handles ALL NextAuth endpoints:
//   GET  /api/auth/signin
//   GET  /api/auth/signout
//   GET  /api/auth/callback/github
//   GET  /api/auth/session
//   GET  /api/auth/csrf
//   GET  /api/auth/providers
//
// The [...nextauth] catch-all segment routes all of them here.
// We re-export the handler for both GET and POST — NextAuth needs both.

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

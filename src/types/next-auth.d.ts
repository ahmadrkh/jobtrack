// Extends the built-in NextAuth types so TypeScript knows that
// session.user.id is always a string (added by our session callback in lib/auth.ts).
// Without this, accessing session.user.id would be a type error.

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

// With the JWT session strategy, the user id is carried on the token (set in the
// jwt callback) and read back in the session callback. Declare it so both sides
// are type-safe.
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

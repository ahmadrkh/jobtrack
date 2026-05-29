// Middleware runs on the Edge Runtime before every matched request.
// We chain two middlewares:
//   1. next-intl — adds locale prefix routing (/en/*, /fa/*)
//   2. next-auth — protects all non-public routes

import createMiddleware from 'next-intl/middleware'
import { withAuth }     from 'next-auth/middleware'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

// next-intl: handles /en ↔ /fa prefix routing and redirects bare /→/en
const intlMiddleware = createMiddleware(routing)

// Combined: run intl middleware for all requests, but gate private routes with auth
export default withAuth(
  function middleware(req: NextRequest) {
    return intlMiddleware(req)
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl

        // Public paths — always allow through
        if (
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/_next') ||
          pathname.match(/\.(ico|png|svg|webmanifest|txt|js\.map)$/) ||
          // locale-prefixed login pages: /en/login, /fa/login
          pathname.match(/^\/(en|fa)\/login(\/.*)?$/) ||
          // bare /login redirect (intl will redirect it to /en/login)
          pathname === '/login'
        ) {
          return true
        }

        return !!token
      },
    },
    pages: {
      signIn: '/en/login',
    },
  },
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

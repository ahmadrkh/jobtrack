'use client'

// All client-side providers in one place.
// Both SessionProvider (NextAuth) and QueryClientProvider (TanStack Query)
// need to wrap the app — we compose them here so layout.tsx stays clean.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime:    5 * 60_000,
            retry:     1,
          },
        },
      }),
  )

  return (
    // SessionProvider makes useSession() available everywhere in the tree.
    // It auto-refreshes the session before it expires.
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  )
}

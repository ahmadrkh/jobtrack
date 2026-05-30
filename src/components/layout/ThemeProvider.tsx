'use client'

// Thin re-export of next-themes ThemeProvider.
// Keeping it in a separate 'use client' file lets layout.tsx remain
// a server component while still wrapping the tree in a client context.

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from "react"

export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

'use client'

// Thin re-export of next-themes ThemeProvider.
// Keeping it in a separate 'use client' file lets layout.tsx remain
// a server component while still wrapping the tree in a client context.

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

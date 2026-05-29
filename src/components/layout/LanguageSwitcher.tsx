'use client'

import { useLocale }  from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button }     from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { localeLabel } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

export function LanguageSwitcher() {
  const locale   = useLocale() as Locale
  const router   = useRouter()
  const pathname = usePathname()

  function switchLocale(next: Locale) {
    if (next === locale) return

    // Swap the locale prefix in the current pathname.
    // e.g. /en/stats → /fa/stats
    const newPath = pathname.replace(`/${locale}`, `/${next}`)
    router.push(newPath)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Switch language">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(localeLabel) as Locale[]).map(loc => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={loc === locale ? 'font-semibold' : ''}
          >
            {localeLabel[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

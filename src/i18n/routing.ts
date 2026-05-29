import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales:       ['en', 'fa'],
  defaultLocale: 'en',

  // Persian is RTL; we store the direction map here so layout.tsx can
  // read it without duplicating knowledge.
  // (next-intl doesn't expose this natively, so we export it alongside.)
})

export type Locale = (typeof routing.locales)[number]

export const localeDir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fa: 'rtl',
}

export const localeLabel: Record<Locale, string> = {
  en: 'English',
  fa: 'فارسی',
}

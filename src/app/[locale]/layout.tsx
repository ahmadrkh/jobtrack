import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages }            from 'next-intl/server'
import { routing, localeDir }     from '@/i18n/routing'
import type { Locale }            from '@/i18n/routing'
import localFont                  from 'next/font/local'

// Samim — a clean Persian typeface, self-hosted via next/font. Loaded here but
// applied only for the `fa` locale (see the wrapper <div> below). preload:false
// so English pages never fetch it.
const samim = localFont({
  src: [
    { path: './fonts/Samim.woff2',      weight: '400', style: 'normal' },
    { path: './fonts/Samim-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-samim',
  display:  'swap',
  preload:  false,
})

interface Props {
  children:  React.ReactNode
  params:    Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fa' ? 'جاب‌تِرک' : 'JobTrack',
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate locale; render 404 for unknown segments
  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()
  const dir      = localeDir[locale as Locale]

  return (
    // next-themes ThemeProvider (in root layout) toggles `class` on <html>.
    // We override `lang` and `dir` on a wrapper <div> instead so the root
    // <html> element managed by root layout isn't doubled.
    // For Persian we also switch the font to Samim (self-hosted). The wrapper
    // uses `display: contents` so it adds no box, but font-family still
    // cascades to every child; English (en) keeps the default font.
    <div
      lang={locale}
      dir={dir}
      className={locale === 'fa' ? `${samim.variable} font-samim contents` : 'contents'}
    >
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  )
}

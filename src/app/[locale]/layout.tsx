import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages }            from 'next-intl/server'
import { routing, localeDir }     from '@/i18n/routing'
import type { Locale }            from '@/i18n/routing'

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
    // The font for Persian is set via Tailwind: `font-sans` falls back to
    // system-ui which renders Vazirmatn/Tahoma correctly on all OSes.
    <div lang={locale} dir={dir} className="contents">
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  )
}

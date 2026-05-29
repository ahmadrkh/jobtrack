import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate the locale coming from the [locale] segment.
  // Fall back to the default locale if it's missing or unknown.
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as 'en' | 'fa')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})

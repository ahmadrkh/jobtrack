import { AuthPanel }        from './AuthPanel'
import { Briefcase }        from 'lucide-react'
import { getTranslations }  from 'next-intl/server'

export default async function LoginPage() {
  const t = await getTranslations('login')

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-4">
            <Briefcase className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        {/* GitHub / Google / email+username / demo */}
        <AuthPanel />

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground px-4">{t('privacyNote')}</p>
      </div>
    </main>
  )
}

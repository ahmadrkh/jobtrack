'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { Github, Loader2, Sparkles } from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Label }     from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

type Mode    = 'signin' | 'signup'
type Pending = null | 'github' | 'google' | 'demo' | 'credentials'

// lucide-react has no Google brand mark, so inline the official four-colour "G".
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

export function AuthPanel() {
  const t      = useTranslations('login')
  const locale = useLocale()
  const home   = `/${locale}`

  const [mode, setMode]       = useState<Mode>('signin')
  const [pending, setPending] = useState<Pending>(null)
  const [error, setError]     = useState<string | null>(null)

  const [identifier, setIdentifier] = useState('')
  const [email, setEmail]           = useState('')
  const [username, setUsername]     = useState('')
  const [password, setPassword]     = useState('')

  const busy = pending !== null

  function oauth(provider: 'github' | 'google' | 'demo') {
    setError(null)
    setPending(provider)
    signIn(provider, { callbackUrl: home })
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending('credentials')
    try {
      // Sign-up first creates the account, then signs in with the same password.
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, username, password }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? t('registerFailed'))
          setPending(null)
          return
        }
      }

      const result = await signIn('credentials', {
        identifier: mode === 'signup' ? email : identifier,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError(t('invalidCredentials'))
        setPending(null)
        return
      }
      // Full navigation so the middleware picks up the fresh session cookie.
      window.location.href = home
    } catch {
      setError(t('somethingWrong'))
      setPending(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* OAuth */}
      <div className="space-y-2">
        <Button size="lg" variant="outline" className="w-full gap-2" onClick={() => oauth('github')} disabled={busy}>
          {pending === 'github' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
          {t('continueGithub')}
        </Button>
        <Button size="lg" variant="outline" className="w-full gap-2" onClick={() => oauth('google')} disabled={busy}>
          {pending === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon className="h-5 w-5" />}
          {t('continueGoogle')}
        </Button>
      </div>

      {/* divider */}
      <div className="relative py-1">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs uppercase tracking-wide text-muted-foreground">
          {t('or')}
        </span>
      </div>

      {/* email / username + password */}
      <form onSubmit={onSubmit} className="space-y-3 text-start">
        {mode === 'signup' ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={busy} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('username')}</Label>
              <Input id="username" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={busy} />
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="identifier">{t('emailOrUsername')}</Label>
            <Input id="identifier" type="text" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required disabled={busy} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password">{t('password')}</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={busy}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>
          {pending === 'credentials' && <Loader2 className="h-5 w-5 animate-spin" />}
          {mode === 'signup' ? t('createAccount') : t('signIn')}
        </Button>
      </form>

      {/* mode toggle */}
      <p className="text-sm text-muted-foreground">
        {mode === 'signup' ? t('haveAccount') : t('noAccount')}{' '}
        <button
          type="button"
          className="font-medium text-primary hover:underline disabled:opacity-50"
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null) }}
          disabled={busy}
        >
          {mode === 'signup' ? t('signIn') : t('createAccount')}
        </button>
      </p>

      {/* demo */}
      <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => oauth('demo')} disabled={busy}>
        {pending === 'demo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {t('tryDemo')}
      </Button>
    </div>
  )
}

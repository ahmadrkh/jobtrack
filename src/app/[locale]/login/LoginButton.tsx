'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

interface Props {
  label:         string
  signingInLabel: string
}

export function LoginButton({ label, signingInLabel }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    await signIn('github', { callbackUrl: '/' })
  }

  return (
    <Button
      size="lg"
      className="w-full gap-2"
      onClick={handleSignIn}
      disabled={loading}
    >
      <Github className="h-5 w-5" />
      {loading ? signingInLabel : label}
    </Button>
  )
}

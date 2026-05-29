'use client'

import { useEffect, useState } from 'react'
import { FileText, Loader2 }   from 'lucide-react'
import { Header }              from '@/components/layout/Header'
import { ResumeUpload }        from '@/components/resume/ResumeUpload'
import { ResumeViewer }        from '@/components/resume/ResumeViewer'

export default function ResumePage() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [removing,  setRemoving]  = useState(false)

  // Fetch current resume URL on mount
  useEffect(() => {
    fetch('/api/resume')
      .then(r => r.json())
      .then(d => setResumeUrl(d.resumeUrl ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove() {
    setRemoving(true)
    await fetch('/api/resume', { method: 'DELETE' })
    setResumeUrl(null)
    setRemoving(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Page header */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">My Résumé</h1>
            <p className="text-sm text-muted-foreground">
              Store your résumé here and access it from any device.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : resumeUrl ? (
          <ResumeViewer
            url={resumeUrl}
            onRemove={handleRemove}
            removing={removing}
          />
        ) : (
          <ResumeUpload onUploaded={setResumeUrl} />
        )}
      </main>
    </div>
  )
}

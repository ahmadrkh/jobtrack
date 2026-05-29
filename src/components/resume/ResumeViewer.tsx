'use client'

import { useState } from 'react'
import { ExternalLink, Download, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  url:        string
  onRemove:   () => void
  removing:   boolean
}

export function ResumeViewer({ url, onRemove, removing }: Props) {
  const [loaded, setLoaded] = useState(false)

  const filename = url.split('/').pop() ?? 'resume.pdf'

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
        <a
          href={url}
          download={filename}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 ms-auto gap-1.5"
          onClick={onRemove}
          disabled={removing}
        >
          {removing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Trash2 className="h-3.5 w-3.5" />
          }
          Remove
        </Button>
      </div>

      {/* PDF iframe */}
      <div className="relative rounded-xl border overflow-hidden bg-muted" style={{ height: '70vh' }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          src={`${url}#view=FitH`}
          className="w-full h-full"
          title="Resume preview"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}

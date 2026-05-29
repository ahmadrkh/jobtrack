'use client'

// Per-application cover letter editor.
// Stored in localStorage keyed by applicationId (fast, no DB table needed).
//
// Features:
//   • Template variables: {{company}}, {{role}}, {{date}} — auto-substituted in preview
//   • "Use template" button inserts a professional starter
//   • Character counter
//   • Export as .txt download
//   • Live preview that shows substituted variables

import { useState, useEffect, useCallback } from 'react'
import { FileEdit, ChevronDown, ChevronUp, Download, Eye, EyeOff, Wand2 } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const TEMPLATE = `Dear Hiring Manager,

I am writing to express my strong interest in the {{role}} position at {{company}}. Having reviewed the role description carefully, I am confident that my background aligns well with what you are looking for.

[Paragraph 2: Describe your most relevant experience and a key achievement that maps to the role.]

[Paragraph 3: Explain why you are excited about {{company}} specifically — their mission, product, culture, or recent work.]

[Paragraph 4: Reiterate your enthusiasm and suggest a next step.]

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to the team at {{company}}.

Yours sincerely,
[Your Name]`

function substitute(text: string, company: string, role: string): string {
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  return text
    .replace(/\{\{company\}\}/g, company || '{{company}}')
    .replace(/\{\{role\}\}/g,    role    || '{{role}}')
    .replace(/\{\{date\}\}/g,    date)
}

function loadLetter(applicationId: string): string {
  try { return localStorage.getItem(`cover_${applicationId}`) ?? '' }
  catch { return '' }
}

function saveLetter(applicationId: string, text: string) {
  try { localStorage.setItem(`cover_${applicationId}`, text) }
  catch { /* ignore */ }
}

interface Props {
  applicationId: string
  company:       string
  role:          string
}

export function CoverLetterEditor({ applicationId, company, role }: Props) {
  const [open,    setOpen]    = useState(false)
  const [text,    setText]    = useState('')
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (open && !text) setText(loadLetter(applicationId))
  }, [open, applicationId, text])

  const handleChange = useCallback((value: string) => {
    setText(value)
    saveLetter(applicationId, value)
  }, [applicationId])

  function useTemplate() {
    handleChange(TEMPLATE)
    setPreview(false)
  }

  function download() {
    const content = substitute(text, company, role)
    const blob    = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = `cover-letter-${company.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <FileEdit className="h-4 w-4 text-muted-foreground" />
          Cover Letter
          {text && (
            <span className="rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 text-xs">
              Draft saved
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t p-3 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {!text && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={useTemplate}>
                <Wand2 className="h-3.5 w-3.5" />
                Use template
              </Button>
            )}
            <Button
              variant="ghost" size="sm" className="gap-1.5 text-xs ms-auto"
              onClick={() => setPreview(p => !p)}
            >
              {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </Button>
            {text && (
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={download}>
                <Download className="h-3.5 w-3.5" />
                Export .txt
              </Button>
            )}
          </div>

          {/* Editor or preview */}
          {preview ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm whitespace-pre-wrap leading-relaxed font-mono min-h-[240px]">
              {substitute(text, company, role) || (
                <span className="text-muted-foreground italic">Nothing written yet.</span>
              )}
            </div>
          ) : (
            <Textarea
              className="min-h-[240px] text-sm resize-y font-mono"
              placeholder={`Start writing your cover letter for ${company}…\n\nTip: Use {{company}}, {{role}}, and {{date}} as placeholders — they'll be substituted in the preview.`}
              value={text}
              onChange={e => handleChange(e.target.value)}
            />
          )}

          {/* Footer stats */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} characters · saved to browser</span>
          </div>
        </div>
      )}
    </div>
  )
}

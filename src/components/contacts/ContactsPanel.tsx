'use client'

// Expandable contact manager for a single application.
// Shows all saved contacts (recruiter, hiring manager, etc.) and lets the user
// add, edit, or delete them inline.

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserPlus, Mail, Phone, Linkedin, Trash2, Pencil,
  ChevronDown, ChevronUp, Loader2, User,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { cn }       from '@/lib/utils'

interface Contact {
  id:            string
  applicationId: string
  name:          string
  title:         string | null
  email:         string | null
  phone:         string | null
  linkedin:      string | null
  notes:         string | null
  createdAt:     string
}

interface Props {
  applicationId: string
}

const EMPTY_FORM = { name: '', title: '', email: '', phone: '', linkedin: '', notes: '' }

export function ContactsPanel({ applicationId }: Props) {
  const [open,       setOpen]       = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const queryClient                 = useQueryClient()
  const qKey                        = ['contacts', applicationId]

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: qKey,
    queryFn:  async () => {
      const res = await fetch(`/api/contacts?applicationId=${applicationId}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: open,
  })

  const saveContact = useMutation({
    mutationFn: async (data: typeof EMPTY_FORM) => {
      const url    = editId ? `/api/contacts/${editId}` : '/api/contacts'
      const method = editId ? 'PATCH' : 'POST'
      const body   = editId ? data : { ...data, applicationId }
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qKey })
      setShowForm(false)
      setEditId(null)
      setForm(EMPTY_FORM)
    },
  })

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  function startEdit(c: Contact) {
    setEditId(c.id)
    setForm({
      name: c.name, title: c.title ?? '', email: c.email ?? '',
      phone: c.phone ?? '', linkedin: c.linkedin ?? '', notes: c.notes ?? '',
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Contacts
          {contacts.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
              {contacts.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="border-t divide-y">
          {isLoading && (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Contact list */}
          {contacts.map(c => (
            <div key={c.id} className="px-3 py-2.5 flex items-start justify-between gap-2 group">
              <div className="space-y-0.5 min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                {c.title && <p className="text-xs text-muted-foreground">{c.title}</p>}
                <div className="flex flex-wrap gap-2 mt-1">
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                      <Mail className="h-3 w-3" />{c.email}
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                      <Phone className="h-3 w-3" />{c.phone}
                    </a>
                  )}
                  {c.linkedin && (
                    <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                      <Linkedin className="h-3 w-3" />LinkedIn
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(c)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                  onClick={() => deleteContact.mutate(c.id)}
                  disabled={deleteContact.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add / Edit form */}
          {showForm ? (
            <div className="p-3 space-y-2 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {editId ? 'Edit contact' : 'New contact'}
              </p>
              {(['name', 'title', 'email', 'phone', 'linkedin'] as const).map(field => (
                <div key={field}>
                  <Label className="text-xs capitalize">{field}</Label>
                  <Input
                    size={1}
                    className="h-7 text-xs mt-0.5"
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={field === 'linkedin' ? 'https://linkedin.com/in/…' : ''}
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1" onClick={() => saveContact.mutate(form)} disabled={!form.name || saveContact.isPending}>
                  {saveContact.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelForm}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add contact
            </button>
          )}
        </div>
      )}
    </div>
  )
}

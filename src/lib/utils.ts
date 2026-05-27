import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Shadcn's standard utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a date string as "12 May 2025"
export function formatDate(date: string | Date | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date))
}

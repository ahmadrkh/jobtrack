// Fuzzy duplicate detection for job applications.
// Uses Levenshtein distance to compare company names and role titles.
// Returns matches above a similarity threshold so the user can decide whether
// to proceed or update the existing application instead.

import type { Application } from '@/types'

// ── Levenshtein distance ──────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface DuplicateMatch {
  application: Application
  companyScore: number
  roleScore:    number
  /** Combined score 0–1; higher = more similar */
  score:        number
}

/**
 * Returns existing applications that look similar to the candidate.
 * Ignores the application with `excludeId` (used when editing).
 */
export function findDuplicates(
  candidate: { company: string; role: string },
  existing:  Application[],
  excludeId?: string,
  threshold = 0.72,
): DuplicateMatch[] {
  return existing
    .filter(a => a.id !== excludeId)
    .map(a => {
      const companyScore = similarity(candidate.company, a.company)
      const roleScore    = similarity(candidate.role,    a.role)
      const score        = companyScore * 0.6 + roleScore * 0.4
      return { application: a, companyScore, roleScore, score }
    })
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

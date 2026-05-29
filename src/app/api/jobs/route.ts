// GET /api/jobs?q=react&category=software-dev&limit=20
//
// Proxies the Remotive public API (no API key required).
// We proxy it server-side to:
//   - avoid CORS issues
//   - apply caching via Next.js fetch revalidation
//   - normalise the shape into our JobListing type

import { NextRequest, NextResponse } from 'next/server'

// @ts-ignore
export interface JobListing_UNUSED {
// replaced — see @/types/jobs

  id:          number
  title:       string
  company:     string
  location:    string
  category:    string
  jobType:     string
  salary:      string
  url:         string
  publishedAt: string
  description: string   // HTML — sanitise before rendering
  logo:        string | null
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q        = searchParams.get('q')         ?? ''
  const category = searchParams.get('category')  ?? ''
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const params = new URLSearchParams()
  if (q)        params.set('search',   q)
  if (category) params.set('category', category)

  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?${params}`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 }, // cache 5 minutes
      },
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
    }

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs: JobListing[] = (data.jobs ?? []).slice(0, limit).map((j: any) => ({
      id:          j.id,
      title:       j.title,
      company:     j.company_name,
      location:    j.candidate_required_location || 'Remote',
      category:    j.category,
      jobType:     j.job_type,
      salary:      j.salary || '',
      url:         j.url,
      publishedAt: j.publication_date,
      description: j.description,
      logo:        j.company_logo_url || null,
    }))

    return NextResponse.json({ jobs, total: data.job-count ?? jobs.length })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

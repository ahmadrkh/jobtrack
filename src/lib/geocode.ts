// Geocoding via Nominatim (OpenStreetMap) — free, no API key required.
// Rate limit: max 1 request/second. We cache results in a module-level Map
// so repeated renders never re-hit the network for the same location string.

const cache = new Map<string, { lat: number; lng: number } | null>()

export async function geocode(location: string): Promise<{ lat: number; lng: number } | null> {
  const key = location.trim().toLowerCase()
  if (cache.has(key)) return cache.get(key)!

  try {
    const params = new URLSearchParams({
      q:              location,
      format:         'json',
      limit:          '1',
      addressdetails: '0',
    })
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Nominatim requires a User-Agent identifying your app
          'User-Agent': 'JobTrack/1.0 (job application tracker)',
        },
        next: { revalidate: 86400 }, // cache for 24h at the Next.js layer
      },
    )

    if (!res.ok) { cache.set(key, null); return null }

    const data = await res.json()
    if (!data.length) { cache.set(key, null); return null }

    const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    cache.set(key, result)
    return result
  } catch {
    cache.set(key, null)
    return null
  }
}

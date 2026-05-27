// Next.js App Router icon convention.
// Drop an `icon.tsx` in the app/ directory and Next.js automatically:
//   - Serves it at /icon
//   - Injects <link rel="icon"> into every page's <head>
//   - Generates it at build time using @vercel/og's ImageResponse
//
// No favicon.ico, no <link> tags in layout.tsx, no public/ folder needed.
// This is the modern Next.js 14 way.

import { ImageResponse } from 'next/og'

// Tell Next.js the dimensions and MIME type of the generated image.
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Simplified briefcase shape using pure divs — no SVG needed */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {/* Handle */}
          <div
            style={{
              width: 10,
              height: 4,
              border: '2px solid white',
              borderBottom: 'none',
              borderRadius: '3px 3px 0 0',
            }}
          />
          {/* Body */}
          <div
            style={{
              width: 18,
              height: 11,
              background: 'white',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  )
}

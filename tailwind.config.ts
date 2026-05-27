// Tailwind v3 config in TypeScript.
// The `content` array tells Tailwind WHERE to scan for class names.
// Tailwind is a "purging" CSS framework — it generates a tiny CSS file
// containing ONLY the classes that actually appear in your source files.
// If a file isn't listed here, its classes get removed from the build.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // tailwindcss-animate adds keyframe utilities like animate-in,
    // fade-in, slide-in-from-top — used by Shadcn/UI components.
    require('tailwindcss-animate'),
  ],
}

export default config

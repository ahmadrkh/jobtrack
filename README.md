# JobTrack

A full-stack Kanban board for tracking job applications — built with Next.js 14 App Router, Prisma, TypeScript, and @dnd-kit.

![CI](https://github.com/ahmadrkh/jobtrack/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

---

## Features

- **Kanban board** with 6 stages: Wishlist → Applied → Phone Screen → Interview → Offer → Rejected
- **Drag & drop** cards between columns using @dnd-kit (pointer + touch support)
- **Add applications** via a modal form with Zod validation
- **Optimistic UI** — dragging a card updates the board instantly before the API responds
- **Persistent storage** — SQLite via Prisma (swap to Postgres for production)
- **REST API** — clean CRUD route handlers under `/api/applications`
- **CI/CD** — GitHub Actions runs TypeScript check + ESLint + production build on every push

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | File-based routing, Server + Client Components, built-in API routes |
| Language | TypeScript | End-to-end type safety; Prisma types flow from DB schema to UI |
| ORM | Prisma + SQLite | Schema-first, type-safe queries, easy to migrate to Postgres |
| Validation | Zod | Schema validation shared between API (server) and form (client) |
| Forms | react-hook-form | Minimal re-renders, integrates cleanly with Zod via zodResolver |
| Drag & Drop | @dnd-kit | Accessible, composable, designed for React — better than react-beautiful-dnd |
| Styling | Tailwind CSS | Utility-first; no context switching between CSS files and JSX |
| Icons | Lucide React | Consistent, tree-shakeable icon set |

---

## Project Structure

```
jobtrack/
├── prisma/
│   ├── schema.prisma       # Data model + DB connection
│   └── seed.ts             # Sample Iranian tech company applications
├── src/
│   ├── app/
│   │   ├── api/applications/
│   │   │   ├── route.ts        # GET /api/applications, POST /api/applications
│   │   │   └── [id]/route.ts   # GET, PATCH, DELETE /api/applications/:id
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main board page (Client Component)
│   ├── components/
│   │   ├── forms/
│   │   │   └── ApplicationForm.tsx
│   │   ├── kanban/
│   │   │   ├── JobCard.tsx         # Single draggable card
│   │   │   ├── KanbanColumn.tsx    # Droppable column with SortableContext
│   │   │   └── KanbanBoard.tsx     # DndContext, drag state, optimistic updates
│   │   └── layout/
│   │       └── Header.tsx
│   ├── lib/
│   │   ├── prisma.ts       # Prisma singleton (prevents hot-reload leaks)
│   │   ├── utils.ts        # cn() helper + formatDate()
│   │   └── validations.ts  # Zod schemas shared across API + forms
│   └── types/
│       └── index.ts        # Re-exports Prisma types + KanbanColumn config
└── .github/
    └── workflows/
        └── ci.yml          # Type check + lint + build on push/PR
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone
git clone https://github.com/ahmadrkh/jobtrack.git
cd jobtrack

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Create the database + run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Seed with sample data
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/applications` | List all applications |
| `POST` | `/api/applications` | Create a new application |
| `GET` | `/api/applications/:id` | Get one application |
| `PATCH` | `/api/applications/:id` | Update (partial) — used for drag-and-drop status change |
| `DELETE` | `/api/applications/:id` | Delete an application |

---

## Key Concepts Implemented

**Optimistic UI**: When a card is dragged to a new column, the board updates immediately in local React state. The PATCH request fires in the background. This gives instant feedback without waiting for the network.

**Prisma Singleton Pattern**: In Next.js dev mode, hot-reload recreates module instances. Without the singleton, every save would create a new DB connection until the server runs out of connections. The `globalForPrisma` pattern stores the single instance on `globalThis`.

**Zod + react-hook-form**: The same Zod schema (`createApplicationSchema`) validates data on the server (in the POST route handler) and on the client (via `zodResolver` in the form). One source of truth for validation rules.

**`useDroppable` vs `useSortable`**: Cards use `useSortable` (which combines draggable + sortable). Columns use `useDroppable` (which only receives drops). Their IDs are what `onDragEnd` reads to determine the new column.

---

## Roadmap

- [ ] Edit application details (click card to open edit form)
- [ ] Filter by company name or date range
- [ ] Notes / timeline per application
- [ ] Dark mode
- [ ] Deploy to Vercel + migrate DB to Neon (Postgres)
- [ ] Export to CSV

---

## License

MIT

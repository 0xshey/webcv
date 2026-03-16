# Project: Minimalist Resume Builder — Next.js + Supabase

Build a minimalist, well-structured Next.js App Router application where users can create, edit, and share a digital resume, and download it as a PDF. Follow bulletproof Next.js conventions throughout.

---

## Repo & Code Standards

- App Router only (`app/`), TypeScript strict mode, kebab-case for all files and components
- Co-locate route-specific components near their route; promote to `components/` only when shared
- All providers live in `components/providers/`
- Resume-specific components (`resume`, `section`, `block`, and subvariants) live in `components/resume/`
- Named exports only; one component per file
- Validate all env vars at startup with `@t3-oss/env-nextjs`

---

## Design System

- Shadcn/ui components throughout; Tailwind for all styling
- Strictly minimalist: no shadows, no bordered page containers, no decorative elements
- Avoid varying font sizes for hierarchy — use `text-muted-foreground`, `font-semibold`, `font-medium`, or `uppercase tracking-wide` for distinction instead
- Single neutral font; consistent spacing scale
- Max two-column layout on `lg+`, single column on smaller screens

---

## Data & Backend (Supabase)

- Supabase Auth for authentication (email/password + username claim on signup)
- Database tables:
  - `profiles` — user id, username (unique, URL-safe), created_at
  - `resumes` — user id (FK), content (jsonb — JSON Resume schema blob), structure (jsonb — section order, visibility, layout config), updated_at
- Resume content must conform to the [JSON Resume schema](https://jsonresume.org/schema)
- RLS enabled on all tables; users can only read/write their own data
- Public read access on `resumes` scoped by username for the shareable `/<username>` route

---

## Routes & Pages

### `/` — Landing page
- Centered, minimal layout
- Single prompt: sign up or sign in
- Sign up flow collects username (validated: unique, URL-safe, lowercase) + email + password
- Username becomes the user's public resume URL

### `/dashboard` — Resume editor (authenticated)
- Redirects unauthenticated users to `/`
- Default state: empty resume with a toggle to enter edit mode
- Edit mode toggle is persistent in URL param or local state

### `/[username]` — Public resume view (unauthenticated accessible)
- Renders the user's resume in read-only mode
- Returns `notFound()` if username doesn't exist or resume is empty/hidden

---

## Resume Data Model

- Content stored as a JSON Resume schema-compliant blob in Supabase (`content` jsonb column)
- Structure stored separately as a `structure` jsonb column containing:
  - Section order (array of section keys)
  - Per-section visibility (boolean)
  - Layout config (e.g. `{ columns: 2, basicsPosition: 'top' }`)
- `basics` section is always fixed at top (single column) or top-left (two-column); not reorderable

---

## Edit Mode Behaviour

- Toggle between view and edit mode via a minimal button (no modal, no page transition)
- In edit mode:
  - User can show/hide sections via a section visibility panel
  - Drag-and-drop reordering of sections (excluding `basics`) using `@dnd-kit/core`
  - Within each section, drag-and-drop reordering of blocks
  - Add new blocks to any section via an inline "add" affordance
  - Delete blocks with confirmation
  - Layout toggle: switch between 1-column and 2-column (persisted to `structure`)

---

## Block Editing

- Each block maps to a JSON Resume schema item (e.g. a single work experience entry, a single education entry)
- Short text fields (company, title, date, URL, etc.): Shadcn `Input` with appropriate types (`type="url"`, `type="text"`)
- Date fields: Shadcn date input or a simple `YYYY-MM` text input with validation
- Description/summary fields: Tiptap editor (`@tiptap/react`) restricted to bullet list only — strip all other formatting
- All fields validated client-side with `react-hook-form` + `zod`; errors shown inline

---

## PDF Download

- Download button available in both view and edit mode
- Use `@react-pdf/renderer` to generate a PDF client-side from the current resume state
- PDF styling should mirror the on-screen minimalist layout as closely as possible

---

## Component Structure

```
components/
  providers/            # auth, theme, query providers
  resume/
    resume.tsx          # root resume shell
    section.tsx         # section wrapper
    block.tsx           # individual resume entry
    block-editor.tsx    # edit mode block form
    section-header.tsx
    add-block-button.tsx
  ui/                   # shadcn components (auto-generated)
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  dashboard/
    page.tsx
    layout.tsx
  [username]/
    page.tsx
  layout.tsx
  page.tsx              # landing
lib/
  supabase/             # client, server, middleware helpers
  validations/          # zod schemas mirroring JSON Resume schema
  utils.ts
```

---

## Performance & Misc

- `[username]` page is a Server Component; fetch resume data server-side, no client waterfall
- Debounce all autosave writes to Supabase (500ms)
- Optimistic UI updates on block edits — don't wait for Supabase round-trip to re-render
- No `any` types; all JSON Resume fields typed explicitly from schema
- Middleware protects `/dashboard` and redirects unauthenticated users to `/`

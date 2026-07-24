# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check without building
```

No test suite exists.

## Architecture

React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui. Data lives in **Firebase Firestore**, scoped per signed-in user (Google auth).

**Backend / persistence** (`src/lib/firebase.ts`):
- Firebase config is hardcoded in `firebase.ts` (web config is a public client identifier; access is enforced by Firestore security rules, not secrecy). No `.env` files.
- Firestore with offline persistence (`persistentLocalCache`). `requireUid()` returns the current user's uid or throws.
- Firestore layout: `users/{uid}/resumes/{id}`, `users/{uid}/experiences/{id}`, `users/{uid}/applications/{id}`, `users/{uid}/settings/prefs` (`{ favoriteTags, migrated }`).
- Storage modules (`resumeStorage.ts`, `experienceStorage.ts`, `applicationStorage.ts`) are **async** (return Promises) — `get*/save*/delete*` do Firestore CRUD. Pure factories (`genId`, `createResume`, `createCoverLetter`, `createExperience`, `createApplication`) stay sync. `getAllTags(list)`/`getAllCompanies(list)` are pure derivations over an already-loaded list, not storage reads.
- Components own local state and `await` the async storage calls (no react-query for storage, though `QueryClientProvider` is wired). Editor autosave debounce is 800ms.

**Auth** (`src/shared/auth/`): `AuthProvider` + `useAuth` (Google `signInWithPopup`), `SignInScreen`, `AuthGate`. `AuthGate` in `main.tsx` wraps the router — shows a spinner while loading, `SignInScreen` when signed-out, children when signed-in. On first sign-in it runs `migrateLocalToFirestore.ts` once (guarded by `settings/prefs.migrated`), batch-pushing any legacy `localStorage` data up; localStorage is left intact as a fallback.

**Legacy note**: `appBackup.ts` and its "Export/Import all data" buttons in `ResumesPage` still operate on `localStorage`, now disconnected from Firestore — effectively dead until repointed.

**Deploy (Netlify)**: `netlify.toml` sets `npm run build` → `dist` with an SPA `/* → /index.html` redirect. New live domains must be added under Firebase → Authentication → Settings → Authorized domains for Google sign-in to work.

**Routes** (`src/router.tsx`):
- `/` — `ResumesPage` (list/create/delete resumes)
- `/resume/$resumeId` — `ResumeEditorPage`
- `/resume/$resumeId/preview` — `ResumePreviewPage`

**Data model** (`src/types/resume.ts`):
```
ResumeData
  contacts: Contact[]          (icon, text, optional link)
  sections: Section[]
    subsections: SubSection[]
      bullets: Bullet[]
      tags: Tag[]
      type: 1 | 2 | 3         (controls template rendering layout)
```

Every entity has a string `id` from `genId()` in `resumeStorage.ts` (also used as the Firestore doc id). Fields that can carry a hyperlink come in pairs: `title` + `titleLink`, `subtitle` + `subtitleLink`, etc.

**Editor** (`src/features/resume/components/editor/`):
- `ResumeEditorPage` — top-level, owns `ResumeData` state, debounced autosave
- `SectionEditor` — one section; uses `useSortable` from `@dnd-kit/sortable` for drag reorder
- `SubSectionEditor` — one entry; handles bullets + tags, each with drag handles; auto-appends an empty trailing bullet/tag when the user types into the last one
- `LinkedInput` — text input or textarea paired with a popover link editor; used for any field that supports a hyperlink

**Templates** (`src/features/resume/components/templates/`):
- Each template is a pure component `({ resume: ResumeData }) => JSX` that renders print-ready HTML using inline styles (pt units, no Tailwind).
- `SubSectionType` controls layout per template: type 1 = full row (title · subtitle + date), type 2 = no subtitle, type 3 = varies by template.
- Register new templates in `templates/index.ts` `TEMPLATES` array — they appear automatically in the preview page selector.
- Shared helpers in `templates/shared.tsx`: `LinkedText` (span or `<a>`), `TemplateIcon` (dynamic Lucide icon by name string).

**Drag-and-drop**: `@dnd-kit/core` + `@dnd-kit/sortable`. `PointerSensor` with `distance: 5` activation. Pattern: wrap list in `DndContext` + `SortableContext`, call `useSortable` in each item, spread `attributes`/`listeners` onto the grip handle button only (not the whole row).

## Styling conventions

- UI chrome uses Tailwind utility classes and shadcn/ui tokens (`bg-card`, `text-muted-foreground`, etc.)
- Template output uses inline styles with `pt` units — Tailwind must not appear in template components
- `cn()` from `src/lib/utils.ts` for conditional class merging

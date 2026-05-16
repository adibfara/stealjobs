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

React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui. All resume data lives in `localStorage` via `src/lib/resumeStorage.ts` — there is no backend.

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

Every entity has a string `id` from `genId()` in `resumeStorage.ts`. Fields that can carry a hyperlink come in pairs: `title` + `titleLink`, `subtitle` + `subtitleLink`, etc.

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

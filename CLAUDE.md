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
- `/` — `ResumesPage` (list/create/delete resumes; Themes tab renders `ThemesPage` inline)
- `/resume/$resumeId` — `ResumeEditorPage`
- `/resume/$resumeId/preview` — `ResumePreviewPage`
- `/themes` — `ThemesPage` (gallery: built-in + custom themes, new/import/duplicate/delete/export)
- `/themes/$themeId` — `ThemeEditorPage` (visual editor, see Custom themes below)

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

## Custom themes (`src/features/theme/`)

A theme is a JSON document (`ThemeData`, `src/types/theme.ts`) that fully describes a print layout, replacing the hardcoded template components for anything user-created. Custom themes are **PDF/print only** — Word export always falls back to a fixed code layout when a custom theme is active (`exportToWord` is template-independent, no special-casing needed).

Theme selection reuses the existing `resume.selectedTemplate` field — no schema change to `ResumeData`. `resolveTheme(id, customList)` in `themeStorage.ts` looks up a theme by that id.

**`ThemeData` shape**:
```
ThemeData
  palette: Palette              (8 named color roles: background/surface/text/muted/faint/primary/accent/border)
  page: PageStyle                (background, paddingV, paddingH)
  root: ThemeNode                 (recursive tree)
    kind: 'row'|'column'|'box'   (containers, have children)
       | 'text'|'image'|'bullets'|'icon'   (elements, no children)
    repeat?: RepeatSource         (containers only — iterates a collection, see below)
    binding?: Binding             (elements only — data reference, or {literal} for static text/URL)
    visibleWhen?: Condition        (conditional rendering)
    style: NodeStyle              (layout + typography + color, see nodeStyleToCss.ts)
```

**Scope / data binding model**: rendering carries a `Scope` (`resolve.ts`) — `{ resume, section?, subsection?, contact?, bullet?, tag?, image? }` — that widens as `repeat` containers are entered (`extendScope`). A node's `RepeatSource` (`contacts`/`sections`/`subsections`/`bullets`/`tags`/`images`) requires a specific ancestor already be in scope (e.g. `bullets`/`tags`/`images` require an ancestor repeating `subsections`) — enforced by `themeScope.ts`'s `ancestorScope`/`availableRepeatOptions`/`availableBindings`, which the inspector UI uses to only offer legal choices at a given tree position. `Binding` values map 1:1 to `ResumeData` fields (`resume.title`, `contact.text`, `subsection.date`, `image.imageLink`, …); `{ literal: string }` is static text for text nodes and a raw image URL for image nodes (`resolveBinding` populates both `text` and `src` for literals).

**Rendering**: `ThemeRenderer.tsx` is the single source of truth for print/preview output (`renderNode`/`renderNodeBody`, pure, no editor concerns). `nodeStyleToCss.ts` converts `NodeStyle` → inline `pt`-based CSS (`resolveColor`, `imageDimensionStyle` — the latter is also used by the editor canvas so on-canvas image sizing/circle-cropping never drifts from print output).

**Storage** (`src/lib/themeStorage.ts`, mirrors `resumeStorage.ts`): `users/{uid}/themes/{id}`, async CRUD (`getThemes`/`getTheme`/`saveTheme`/`deleteTheme`), `createTheme(name, from?)` (defaults to duplicating the built-in seed theme), `exportThemeAsJson`/`importThemeFromFile`, `stripUndefined` before every `setDoc` (Firestore rejects `undefined`).

**Built-in seed theme**: `builtinThemes.ts` hand-authors `modernRowTheme` (`id: 'modern-row'`, `builtin: true`) as a `ThemeNode` tree reproducing the legacy `ModernRowTemplate.tsx`. Built-in themes can't be edited in place — editing one forks it via `createTheme` ("Save as new theme"). `ModernRowTemplate`/`ModernTemplate`/`ProfessionalTemplate`/`ClassicTemplate` (`templates/`) remain as non-editable legacy React-component templates, selectable alongside JSON themes in the preview page.

**Visual editor** (`ThemeEditorPage.tsx`, route `/themes/$themeId`): left sidebar (element toolbar + delete-selected + inspector, stacked) and canvas render side-by-side by default and wrap to stacked when the window is too narrow. Palette editing is a popover off the header button, not an always-visible panel.
- `themeTree.ts` — pure immutable tree ops: `createNode`, `findNode`, `nodePath` (root→node breadcrumb, used by the inspector), `updateNode`, `removeNode`, `insertAt(root, parentId, index, node)`, `moveNodeAt(root, id, parentId, index)`. Addressing is index-based (`{parentId, index}`), not the before/after/inside model.
- `ThemeEditorCanvas.tsx` — `@dnd-kit/core` (not `/sortable`) DnD: toolbar buttons are drag sources (`useDraggable`, `data: {type:'new', kind}`), gaps between rendered nodes are drop zones (`useDroppable`, `data: {parentId, index}`), existing nodes are also drag sources for reordering (`data: {type:'existing', id}`). Click-to-select with outline highlight; hover state is tracked via one delegated `onMouseOver`/`closest('[data-node-id]')` on the canvas container (not per-node listeners — nested mouseenter/leave has gaps) so hovering previews what a click would select. **Editor-canvas simplification**: repeated containers render only the first collection item (full repeats only show in the real `ThemeRenderer`, used both for the Preview pane and the final print output).
- `ThemeInspector.tsx` — right-hand property panel: breadcrumb header (`nodePath`, clickable to reselect an ancestor), "Repeat over" (containers) / "Shows" (elements, data reference or literal) constrained by `themeScope.ts`, then kind-specific controls (image: width/height/circle-or-radius; icon: static fallback icon; container: width mode/gap/align/wrap; text: font/size/weight/color) and universal controls (padding/margin/background/corner radius — all in `pt`, sliders step `0.1` so sub-1pt values are reachable).

## Styling conventions

- UI chrome uses Tailwind utility classes and shadcn/ui tokens (`bg-card`, `text-muted-foreground`, etc.)
- Template output uses inline styles with `pt` units — Tailwind must not appear in template components
- `cn()` from `src/lib/utils.ts` for conditional class merging

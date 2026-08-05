import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Copy, Check, Trash2, Download, Upload, Sparkles, ChevronRight, Palette as PaletteIcon, Type as TypeIcon, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getThemes,
  saveTheme,
  deleteTheme,
  createTheme,
  exportThemeAsJson,
  importThemeFromFile,
} from '@/lib/themeStorage';
import { modernRowTheme, builtinThemes } from './builtinThemes';
import { PaletteLibraryDialog } from './palettes';
import { StyleLibraryDialog } from './styles';
import type { ThemeData } from '@/types/theme';

const AI_THEME_IMPORT_DOC = `# Theme Import Format (adib-resume-builder)

"Import" expects a single JSON object describing ONE theme (ThemeData). The
root IS the ThemeData object — do NOT wrap it in an array or envelope. Paste
the result directly, or save it as a .json file.

A theme is a tree of layout nodes ("root") plus a color palette, rendered as
a print-ready resume page. If you're converting a photo/screenshot of a resume
into a theme, reproduce its structure (rows/columns/boxes), colors, fonts,
and spacing as closely as possible using the schema below. All sizes are in
points (pt).

## Top-level object (ThemeData)
- id           string   — unique id, any non-empty string.
- name         string   — display name for the theme.
- palette      Palette  — 8 named colors, see below.
- styleSet     StyleEntry[] — optional named text styles (can be []).
- page         PageStyle — { background: ColorRef, paddingV: number, paddingH: number }.
- root         ThemeNode — the layout tree (see below). Must be kind "column" or "row".
- createdAt    number   — epoch ms, use current time.
- lastModified number   — epoch ms, use current time.

## Palette (all CSS colors, e.g. "#1a1a1a")
background, surface, text, muted, faint, primary, accent, border

## ColorRef
Either one of the palette role names above (e.g. "text") or a literal:
{ "literal": "#ff0000" }

## ThemeNode (recursive)
- id        string
- kind       one of: "row" | "column" | "box" (containers, have children)
                    | "text" | "image" | "bullets" | "icon" (elements, no children)
- children   ThemeNode[]  — only for row/column/box.
- repeat     RepeatSource — only for containers; iterates a collection. One of:
             "contacts" | "sections" | "subsections" | "tags" | "images".
             Nesting rule: a container repeating "subsections" must be inside
             (a descendant of) a container repeating "sections"; "tags"/"images"
             must be inside a container repeating "subsections".
             Do NOT use "bullets" as a repeat value — a "bullets"-kind element
             (see below) auto-renders the current subsection's bullets, no
             repeat/binding needed on it.
- binding    Binding — only for text/image/icon elements; which data field to
             render. One of:
             "resume.title" | "resume.subtitle" | "resume.photo" | "resume.name" |
             "contact.icon" | "contact.text" | "section.title" |
             "subsection.title" | "subsection.subtitle" | "subsection.date" | "subsection.text" |
             "tag.text" | "image.title" | "image.subtitle" | "image.imageLink" |
             or a literal for static text/image URL: { "literal": "some text or URL" }
             ("bullets"-kind elements never have a binding.)
- visibleWhen Condition — optional, hide/show based on data (rarely needed; omit if unsure).
- style      NodeStyle — layout + typography + color, see below.

## NodeStyle (all optional)
- direction: "row" | "column" (for box containers)
- wrap: boolean
- widthMode: "hug" | "fill" | "fixed", widthValue: number (pt, for "fixed")
- gap: number (pt)
- align: "start" | "center" | "end" (horizontal), verticalAlign: "start" | "center" | "end"
- padding / margin: [top, right, bottom, left] in pt
- fontFamily: "instrument-sans" | "dm-serif" | "geist" | "crimson-pro" | "eb-garamond" | "lora" | "ubuntu"
- fontSize: number (pt), fontWeight: 400 | 600 | 700, italic: boolean
- color / background: ColorRef
- lineHeight: number (multiplier, e.g. 1.4), letterSpacing: number
- textTransform: "none" | "uppercase"
- borderRadius: number (pt)
- border: { width: number, color: ColorRef, style: "solid" | "dashed" | "dotted" } | null
- iconName: string (Lucide icon name, for "icon" nodes), iconSize: number
- bulletMarker: "dot" | "none" (for "bullets" nodes)
- imageWidth / imageHeight / imageRadius: number (pt), imageCircle: boolean (for "image" nodes)
- opacity: number (0-1)

## Notes
- Every node needs a unique "id" string. Random short strings are fine.
- A "text" node's content comes from its "binding", not from style.
- Reuse the same shape for repeated content: put a "repeat" on a container,
  then bind its children to the singular field (e.g. repeat "bullets" on a
  container whose child text node binds "bullet.text").
- Keep it simple: prefer row/column nesting with padding/gap over precise
  pixel positioning.

## Minimal example (name, title, one section with one entry)
{
  "id": "theme1",
  "name": "My Theme",
  "palette": {
    "background": "#ffffff", "surface": "#f5f5f5", "text": "#111111",
    "muted": "#666666", "faint": "#999999", "primary": "#1d4ed8",
    "accent": "#1d4ed8", "border": "#e5e5e5"
  },
  "styleSet": [],
  "page": { "background": "background", "paddingV": 28, "paddingH": 28 },
  "root": {
    "id": "root", "kind": "column", "style": { "gap": 12 },
    "children": [
      {
        "id": "header", "kind": "column", "style": { "gap": 4 },
        "children": [
          { "id": "name", "kind": "text", "binding": "resume.title", "style": { "fontSize": 20, "fontWeight": 700 } },
          { "id": "sub", "kind": "text", "binding": "resume.subtitle", "style": { "fontSize": 11, "color": "muted" } }
        ]
      },
      {
        "id": "sections", "kind": "column", "repeat": "sections", "style": { "gap": 6 },
        "children": [
          { "id": "sec-title", "kind": "text", "binding": "section.title", "style": { "fontSize": 12, "fontWeight": 700, "textTransform": "uppercase", "color": "primary" } },
          {
            "id": "subsections", "kind": "column", "repeat": "subsections", "style": { "gap": 3 },
            "children": [
              { "id": "ss-title", "kind": "text", "binding": "subsection.title", "style": { "fontSize": 11, "fontWeight": 600 } },
              { "id": "ss-bullets", "kind": "bullets", "style": { "fontSize": 10, "bulletMarker": "dot" } }
            ]
          }
        ]
      }
    ]
  },
  "createdAt": 0,
  "lastModified": 0
}`;

interface ThemeCardProps {
  theme: ThemeData;
  onNavigate: (id: string) => void;
  onDuplicate: (t: ThemeData, e: React.MouseEvent) => void;
  onDelete: (t: ThemeData, e: React.MouseEvent) => void;
  onExport: (t: ThemeData, e: React.MouseEvent) => void;
}

function ThemeCard({ theme, onNavigate, onDuplicate, onDelete, onExport }: ThemeCardProps) {
  const swatches = [theme.palette.primary, theme.palette.accent, theme.palette.muted, theme.palette.border];
  return (
    <div
      onClick={() => onNavigate(theme.id)}
      className="group relative cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <PaletteIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={e => onExport(theme, e)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" title="Export as JSON">
            <Download className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={e => onDuplicate(theme, e)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </button>
          {theme.builtin ? (
            <span className="flex h-7 w-7 items-center justify-center text-muted-foreground" title="Default theme cannot be deleted">
              <Lock className="h-3.5 w-3.5" />
            </span>
          ) : (
            <button type="button" onClick={e => onDelete(theme, e)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <h3 className="font-semibold leading-tight truncate">{theme.name}</h3>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {swatches.map((c, i) => (
            <span key={i} className="h-4 w-4 rounded-full border border-border" style={{ background: c }} />
          ))}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

export function ThemesPage() {
  const navigate = useNavigate();
  const [themes, setThemes] = React.useState<ThemeData[]>([]);
  const [paletteLibraryOpen, setPaletteLibraryOpen] = React.useState(false);
  const [styleLibraryOpen, setStyleLibraryOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [importRaw, setImportRaw] = React.useState('');
  const [importError, setImportError] = React.useState('');
  const [specOpen, setSpecOpen] = React.useState(false);
  const [specCopied, setSpecCopied] = React.useState(false);
  const importRef = React.useRef<HTMLInputElement>(null);

  async function refresh() {
    const list = await getThemes();
    setThemes(list.sort((a, b) => b.lastModified - a.lastModified));
  }

  React.useEffect(() => { refresh(); }, []);

  const allThemes = [...builtinThemes, ...themes];

  async function handleNew() {
    const t = createTheme('Untitled Theme', modernRowTheme);
    await saveTheme(t);
    navigate({ to: '/themes/$themeId', params: { themeId: t.id } });
  }

  async function handleDuplicate(theme: ThemeData, e: React.MouseEvent) {
    e.stopPropagation();
    const t = createTheme(`${theme.name} (copy)`, theme);
    await saveTheme(t);
    refresh();
  }

  async function handleDelete(theme: ThemeData, e: React.MouseEvent) {
    e.stopPropagation();
    if (theme.builtin) return;
    if (!confirm(`Delete theme "${theme.name}"?`)) return;
    await deleteTheme(theme.id);
    refresh();
  }

  function handleExport(theme: ThemeData, e: React.MouseEvent) {
    e.stopPropagation();
    exportThemeAsJson(theme);
  }

  async function importTheme(t: ThemeData) {
    await saveTheme({ ...t, id: crypto.randomUUID?.() ?? `${Date.now()}`, builtin: false, lastModified: Date.now() });
    refresh();
    setImportOpen(false);
    setImportRaw('');
    setImportError('');
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const t = await importThemeFromFile(file);
      await importTheme(t);
    } catch {
      setImportError('Failed to import theme. Make sure the file is valid theme JSON.');
    }
  }

  async function handleImportPaste() {
    try {
      const t = JSON.parse(importRaw) as ThemeData;
      await importTheme(t);
    } catch {
      setImportError('Failed to import theme. Make sure the pasted text is valid theme JSON.');
    }
  }

  async function handleCopySpec() {
    try {
      await navigator.clipboard.writeText(AI_THEME_IMPORT_DOC);
      setSpecCopied(true);
      setTimeout(() => setSpecCopied(false), 1500);
    } catch {
      // ignore clipboard failures
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Themes</h2>
        <div className="flex items-center gap-2">
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          <Button variant="outline" size="sm" onClick={() => setPaletteLibraryOpen(true)}>
            <PaletteIcon className="mr-1.5 h-4 w-4" /> Palettes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStyleLibraryOpen(true)}>
            <TypeIcon className="mr-1.5 h-4 w-4" /> Styles
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setImportRaw(''); setImportError(''); setImportOpen(true); }}>
            <Upload className="mr-1.5 h-4 w-4" /> Import
          </Button>
          <Button size="sm" onClick={handleNew}>
            <Plus className="mr-1.5 h-4 w-4" /> New Theme
          </Button>
        </div>
      </div>
      <PaletteLibraryDialog open={paletteLibraryOpen} onOpenChange={setPaletteLibraryOpen} />
      <StyleLibraryDialog open={styleLibraryOpen} onOpenChange={setStyleLibraryOpen} />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import theme</DialogTitle>
            <DialogDescription>
              Upload a <code>.theme.json</code> file or paste theme JSON below. Not sure what
              format is expected? Open the <strong>theme JSON spec</strong> to get a document you
              can hand to an AI (e.g. to convert a resume screenshot into a theme).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="mb-3 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
                <Upload className="mr-1.5 h-4 w-4" /> Choose file…
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setImportOpen(false); setSpecOpen(true); }}>
                <Sparkles className="mr-1.5 h-4 w-4" /> Theme JSON spec
              </Button>
            </div>
            <textarea
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring resize-none"
              value={importRaw}
              onChange={e => { setImportRaw(e.target.value); setImportError(''); }}
              placeholder='{ "id": "...", "name": "...", "palette": { ... }, "root": { ... } }'
            />
            {importError && <p className="mt-1.5 text-xs text-destructive">{importError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImportPaste} disabled={!importRaw.trim()}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={specOpen} onOpenChange={setSpecOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Theme JSON spec
            </DialogTitle>
            <DialogDescription>
              Hand this spec (plus a photo/screenshot of the resume layout you want) to any AI
              (ChatGPT, Claude, …) and ask it to produce a theme JSON. Paste the result back into
              the Import dialog. Copy the document below to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-2 z-10"
              onClick={handleCopySpec}
            >
              {specCopied
                ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Copied</>
                : <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</>}
            </Button>
            <pre className="max-h-[55vh] overflow-auto rounded-md border border-input bg-muted/50 p-4 pt-12 font-mono text-xs whitespace-pre-wrap">
              {AI_THEME_IMPORT_DOC}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSpecOpen(false)}>Close</Button>
            <Button onClick={() => { setSpecOpen(false); setImportRaw(''); setImportError(''); setImportOpen(true); }}>
              Back to Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allThemes.map(t => (
          <ThemeCard
            key={t.id}
            theme={t}
            onNavigate={id => navigate({ to: '/themes/$themeId', params: { themeId: id } })}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        ))}
      </div>
    </div>
  );
}

import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Copy, Trash2, Download, Upload, ChevronRight, Palette as PaletteIcon, Type as TypeIcon, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getThemes,
  saveTheme,
  deleteTheme,
  createTheme,
  exportThemeAsJson,
  importThemeFromFile,
} from '@/lib/themeStorage';
import { modernRowTheme } from './builtinThemes';
import { PaletteLibraryDialog } from './palettes';
import { StyleLibraryDialog } from './styles';
import type { ThemeData } from '@/types/theme';

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
  const importRef = React.useRef<HTMLInputElement>(null);

  async function refresh() {
    const list = await getThemes();
    setThemes(list.sort((a, b) => b.lastModified - a.lastModified));
  }

  React.useEffect(() => { refresh(); }, []);

  const allThemes = [modernRowTheme, ...themes];

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

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const t = await importThemeFromFile(file);
      await saveTheme({ ...t, id: crypto.randomUUID?.() ?? `${Date.now()}`, builtin: false, lastModified: Date.now() });
      refresh();
    } catch {
      alert('Failed to import theme. Make sure it is a valid .theme.json file.');
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Themes</h2>
        <div className="flex items-center gap-2">
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button variant="outline" size="sm" onClick={() => setPaletteLibraryOpen(true)}>
            <PaletteIcon className="mr-1.5 h-4 w-4" /> Palettes
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStyleLibraryOpen(true)}>
            <TypeIcon className="mr-1.5 h-4 w-4" /> Styles
          </Button>
          <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> Import
          </Button>
          <Button size="sm" onClick={handleNew}>
            <Plus className="mr-1.5 h-4 w-4" /> New Theme
          </Button>
        </div>
      </div>
      <PaletteLibraryDialog open={paletteLibraryOpen} onOpenChange={setPaletteLibraryOpen} />
      <StyleLibraryDialog open={styleLibraryOpen} onOpenChange={setStyleLibraryOpen} />
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

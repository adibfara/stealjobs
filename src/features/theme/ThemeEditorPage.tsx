import * as React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Check, Eye, Pencil, Type as TypeIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getResumes } from '@/lib/resumeStorage';
import { getTheme, getThemes, saveTheme, createTheme } from '@/lib/themeStorage';
import { getPalettes, resolvePalette } from '@/lib/paletteStorage';
import { getStyleSets, resolveStyleSet } from '@/lib/styleStorage';
import { defaultStyleSet } from './builtinStyles';
import { modernRowTheme } from './builtinThemes';
import { PalettePopover } from './palettes';
import { StyleDialog } from './styles';
import { ThemeRenderer } from './ThemeRenderer';
import { ThemeCanvas, ThemeToolbar, DeleteSelectedButton } from './ThemeEditorCanvas';
import { ThemeInspector } from './ThemeInspector';
import { removeNode } from './themeTree';
import type { ThemeData, ThemeNode } from '@/types/theme';
import type { ResumeData } from '@/types/resume';

const SAMPLE_RESUME_KEY = 'theme-editor-sample-resume-id';

function useDebouncedSave(theme: ThemeData | null, enabled: boolean, delay = 800) {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!theme || !enabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void saveTheme(theme); }, delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [theme, enabled, delay]);
}

export function ThemeEditorPage() {
  const { themeId } = useParams({ from: '/themes/$themeId' });
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState<ThemeData | null>(null);
  const [isCustom, setIsCustom] = React.useState(false);
  const [allThemes, setAllThemes] = React.useState<ThemeData[]>([modernRowTheme]);
  const [resumes, setResumes] = React.useState<ResumeData[]>([]);
  const [sampleId, setSampleId] = React.useState('');
  const [editingName, setEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showLockDialog, setShowLockDialog] = React.useState(false);
  const [styleDialogOpen, setStyleDialogOpen] = React.useState(false);
  const [focusEntryId, setFocusEntryId] = React.useState<string | null>(null);

  useDebouncedSave(theme, isCustom);

  React.useEffect(() => {
    if (!theme || !isCustom) return;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [theme, isCustom]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const custom = await getTheme(themeId);
      if (cancelled) return;
      let loaded: ThemeData;
      if (custom) {
        loaded = custom;
        setIsCustom(true);
      } else if (themeId === modernRowTheme.id) {
        loaded = modernRowTheme;
        setIsCustom(false);
      } else {
        navigate({ to: '/themes' });
        return;
      }
      if (loaded.paletteId) {
        const palettes = await getPalettes();
        if (cancelled) return;
        const linked = resolvePalette(loaded.paletteId, palettes);
        if (linked) loaded = { ...loaded, palette: linked.colors };
      }
      if (loaded.styleSetId) {
        const styleSets = await getStyleSets();
        if (cancelled) return;
        const linked = resolveStyleSet(loaded.styleSetId, styleSets);
        if (linked) loaded = { ...loaded, styleSet: linked.entries };
      }
      if (!loaded.styleSet) {
        loaded = { ...loaded, styleSet: defaultStyleSet.entries, styleSetId: loaded.styleSetId ?? defaultStyleSet.id };
      }
      setTheme(loaded);
      const customThemes = await getThemes();
      if (cancelled) return;
      setAllThemes([modernRowTheme, ...customThemes]);
      const list = await getResumes();
      if (cancelled) return;
      setResumes(list);
      const lastId = localStorage.getItem(SAMPLE_RESUME_KEY);
      const initial = list.find(r => r.id === lastId) ?? list[0];
      if (initial) setSampleId(initial.id);
    })();
    return () => { cancelled = true; };
  }, [themeId]);

  function selectSample(id: string) {
    setSampleId(id);
    localStorage.setItem(SAMPLE_RESUME_KEY, id);
  }

  function updateRoot(root: ThemeNode) {
    setTheme(prev => prev ? { ...prev, root } : prev);
  }

  async function handleSaveAsNew() {
    if (!theme) return;
    const t = createTheme(theme.name, theme);
    await saveTheme(t);
    navigate({ to: '/themes/$themeId', params: { themeId: t.id } });
  }

  async function handleCreateNew() {
    const t = createTheme('New theme');
    await saveTheme(t);
    navigate({ to: '/themes/$themeId', params: { themeId: t.id } });
  }

  async function commitName() {
    const name = nameDraft.trim();
    if (!name || !theme) { setEditingName(false); return; }
    setTheme(prev => prev ? { ...prev, name } : prev);
    setEditingName(false);
  }

  const sampleResume = resumes.find(r => r.id === sampleId) ?? resumes[0] ?? null;

  if (!theme) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/themes' })}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Themes
        </Button>

        {editingName ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={nameDraft}
              onChange={e => setNameDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="button" onClick={commitName} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"><Check className="h-4 w-4" /></button>
            <button type="button" onClick={() => setEditingName(false)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Select value={theme.id} onValueChange={v => { if (v !== theme.id) navigate({ to: '/themes/$themeId', params: { themeId: v } }); }}>
              <SelectTrigger className="h-8 w-auto min-w-[10rem] text-sm font-medium"><SelectValue /></SelectTrigger>
              <SelectContent>
                {allThemes.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}{t.builtin ? ' (built-in)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCustom && (
              <button
                type="button"
                onClick={() => { setNameDraft(theme.name); setEditingName(true); }}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent"
                title="Rename theme"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1" />

        {sampleResume && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/resume/$resumeId', params: { resumeId: sampleResume.id } })}
            >
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/resume/$resumeId/preview', params: { resumeId: sampleResume.id } })}
            >
              <Eye className="mr-1.5 h-4 w-4" /> Preview
            </Button>
          </div>
        )}

        <PalettePopover theme={theme} onChange={setTheme} />

        <Button variant="outline" size="sm" onClick={() => { setFocusEntryId(null); setStyleDialogOpen(true); }}>
          <TypeIcon className="mr-1.5 h-4 w-4" /> Styles
        </Button>

        {isCustom && saved && <span className="text-xs text-muted-foreground">Saved</span>}

        {resumes.length > 0 && (
          <select
            value={sampleId}
            onChange={e => selectSample(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            {resumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}

        {isCustom ? (
          <span className="text-xs text-muted-foreground">Autosaves</span>
        ) : (
          <Button size="sm" onClick={handleSaveAsNew}>Save as new theme</Button>
        )}
      </div>

      <div className="flex flex-1 min-h-0 flex-wrap overflow-auto">
        <div className="relative flex min-h-[700px] flex-1 basis-[760px]">
          <ThemeCanvas
            theme={theme}
            resume={sampleResume}
            selectedId={selectedId}
            onSelect={id => setSelectedId(id || null)}
            onChange={updateRoot}
            sidebar={
              <div className="w-96 shrink-0 border-r border-border overflow-y-auto flex flex-col">
                <ThemeToolbar />
                <div className="p-3 border-b border-border">
                  <DeleteSelectedButton
                    selectedId={selectedId}
                    onDelete={() => { if (selectedId) { updateRoot(removeNode(theme.root, selectedId)); setSelectedId(null); } }}
                  />
                </div>
                <ThemeInspector
                  theme={theme}
                  selectedId={selectedId}
                  onChange={updateRoot}
                  onSelect={id => setSelectedId(id)}
                  onEditStyle={entryId => { setFocusEntryId(entryId); setStyleDialogOpen(true); }}
                />
              </div>
            }
          />

          {!isCustom && (
            <button
              type="button"
              onClick={() => setShowLockDialog(true)}
              className="group absolute inset-0 z-30 flex cursor-pointer items-start justify-center bg-background/0 backdrop-blur-none transition-all duration-150 hover:bg-background/25 hover:backdrop-blur-[0.5px]"
            >
              <div className="pointer-events-none mt-4 rounded-lg border border-border bg-card px-5 py-4 text-center opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100">
                <p className="text-sm font-medium">This is a built-in theme and can&apos;t be edited directly.</p>
                <p className="mt-1 text-xs text-muted-foreground">Click to duplicate it or start a new theme.</p>
              </div>
            </button>
          )}
        </div>

        <div className="flex min-h-[700px] flex-1 basis-[500px] justify-center border-l border-border bg-muted/30 py-8 overflow-auto">
          {sampleResume ? (
            <div className="w-full shadow-2xl" style={{ maxWidth: '850px', backgroundColor: '#fff', minHeight: '1100px' }}>
              <ThemeRenderer theme={theme} resume={sampleResume} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Create a resume to preview this theme.</p>
          )}
        </div>
      </div>

      <StyleDialog theme={theme} onChange={setTheme} open={styleDialogOpen} onOpenChange={setStyleDialogOpen} focusEntryId={focusEntryId} />

      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Built-in themes can&apos;t be edited</DialogTitle>
            <DialogDescription>
              Duplicate &quot;{theme.name}&quot; to customize it, or start a fresh theme from scratch.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowLockDialog(false); void handleCreateNew(); }}>
              Create new theme
            </Button>
            <Button onClick={() => { setShowLockDialog(false); void handleSaveAsNew(); }}>
              Duplicate this theme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

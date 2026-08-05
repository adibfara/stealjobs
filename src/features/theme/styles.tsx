import * as React from 'react';
import { Check, Copy, Lock, Plus, Trash2, Type as TypeIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TypographyFields } from './TypographyFields';
import { defaultStyleSet, builtinStyleSets } from './builtinStyles';
import { getStyleSets, saveStyleSet, deleteStyleSet, createStyleSet } from '@/lib/styleStorage';
import { genId } from '@/lib/resumeStorage';
import { resolveColor } from './nodeStyleToCss';
import type { NamedStyleSet, Palette, StyleEntry, ThemeData, TypographyStyle } from '@/types/theme';

function useStyleLibrary() {
  const [styleSets, setStyleSets] = React.useState<NamedStyleSet[]>(builtinStyleSets);
  const refresh = React.useCallback(async () => {
    const list = await getStyleSets();
    setStyleSets([...builtinStyleSets, ...list]);
  }, []);
  React.useEffect(() => { refresh(); }, [refresh]);
  const upsertLocal = React.useCallback((s: NamedStyleSet) => {
    setStyleSets(prev => (prev.some(p => p.id === s.id) ? prev.map(p => p.id === s.id ? s : p) : [...prev, s]));
  }, []);
  return { styleSets, refresh, upsertLocal };
}

function EntrySummary({ entry, palette }: { entry: StyleEntry; palette: Palette }) {
  const t = entry.typography;
  return (
    <div className="flex flex-1 items-center gap-2 min-w-0">
      <span className="flex-1 truncate">{entry.name}</span>
      <span className="shrink-0 text-[10px] text-muted-foreground">{t.fontSize ?? '—'}pt</span>
      {t.fontWeight === 700 && <span className="shrink-0 text-[10px] font-bold">B</span>}
      {t.italic && <span className="shrink-0 text-[10px] italic">I</span>}
      {t.color && <span className="h-4 w-4 shrink-0 rounded-full border border-border" style={{ background: resolveColor(t.color, palette) }} title="color" />}
    </div>
  );
}

interface StyleSetRowProps {
  styleSet: NamedStyleSet;
  active?: boolean;
  selected?: boolean;
  onSelect: () => void;
  onApply?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function StyleSetRow({ styleSet, active, selected, onSelect, onApply, onDuplicate, onDelete }: StyleSetRowProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs cursor-pointer ${selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
      onClick={onSelect}
    >
      <span className="flex-1 truncate">{styleSet.name}</span>
      {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" title="Applied to this theme" />}
      {!active && onApply && (
        <button type="button" onClick={e => { e.stopPropagation(); onApply(); }} className="shrink-0 text-[10px] text-primary hover:underline">
          Apply
        </button>
      )}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDuplicate(); }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-accent"
        title="Duplicate style"
      >
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {styleSet.builtin ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground" title="Default style can't be deleted">
          <Lock className="h-3.5 w-3.5" />
        </span>
      ) : (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
          title="Delete style"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

interface StyleDialogProps {
  theme: ThemeData;
  onChange: (theme: ThemeData) => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  focusEntryId?: string | null;
}

export function StyleDialog({ theme, onChange, open, onOpenChange, focusEntryId }: StyleDialogProps) {
  const { styleSets, refresh, upsertLocal } = useStyleLibrary();
  const [viewingId, setViewingId] = React.useState(theme.styleSetId ?? defaultStyleSet.id);
  const [editingEntryId, setEditingEntryId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setViewingId(theme.styleSetId ?? defaultStyleSet.id);
    setEditingEntryId(focusEntryId ?? null);
  }, [open, focusEntryId, theme.styleSetId]);

  const viewing = styleSets.find(s => s.id === viewingId) ?? styleSets[0];
  const isActive = viewing?.id === (theme.styleSetId ?? defaultStyleSet.id);

  function applyStyleSet(s: NamedStyleSet) {
    onChange({ ...theme, styleSet: s.entries, styleSetId: s.id });
    setViewingId(s.id);
  }

  async function duplicateStyleSet(s: NamedStyleSet) {
    const copy = createStyleSet(`${s.name} (copy)`, s.entries.map(e => ({ ...e, id: genId() })));
    upsertLocal(copy);
    setViewingId(copy.id);
    await saveStyleSet(copy);
    await refresh();
  }

  async function removeStyleSet(s: NamedStyleSet) {
    if (s.builtin) return;
    if (!confirm(`Delete style "${s.name}"?`)) return;
    if (s.id === viewingId) setViewingId(defaultStyleSet.id);
    if (s.id === theme.styleSetId) applyStyleSet(defaultStyleSet);
    await deleteStyleSet(s.id);
    await refresh();
  }

  function forkIfBuiltin(s: NamedStyleSet): NamedStyleSet {
    if (!s.builtin) return s;
    // Keep entry ids stable so any node.style.styleRef already pointing at this
    // (now-forked) style set's entries keeps resolving.
    return createStyleSet(`${s.name} (copy)`, s.entries);
  }

  function applyEntryEdit(nextEntries: StyleEntry[]) {
    if (!viewing) return null;
    const wasActive = isActive;
    const target = forkIfBuiltin(viewing);
    const updated: NamedStyleSet = { ...target, entries: nextEntries };
    upsertLocal(updated);
    void saveStyleSet(updated).then(refresh);
    setViewingId(updated.id);
    if (wasActive) onChange({ ...theme, styleSet: nextEntries, styleSetId: updated.id });
    return updated;
  }

  function patchEntry(entryId: string, patch: Partial<TypographyStyle>) {
    if (!viewing) return;
    applyEntryEdit(viewing.entries.map(e => e.id === entryId ? { ...e, typography: { ...e.typography, ...patch } } : e));
  }

  function renameEntry(entryId: string, name: string) {
    if (!viewing) return;
    applyEntryEdit(viewing.entries.map(e => e.id === entryId ? { ...e, name } : e));
  }

  function addEntry() {
    if (!viewing) return;
    const entry: StyleEntry = { id: genId(), name: 'New typography', typography: {} };
    applyEntryEdit([...viewing.entries, entry]);
    setEditingEntryId(entry.id);
  }

  function deleteEntry(entryId: string) {
    if (!viewing) return;
    applyEntryEdit(viewing.entries.filter(e => e.id !== entryId));
    if (editingEntryId === entryId) setEditingEntryId(null);
  }

  async function handleNew() {
    const s = createStyleSet('New style', defaultStyleSet.entries.map(e => ({ ...e, id: genId() })));
    upsertLocal(s);
    setViewingId(s.id);
    await saveStyleSet(s);
    await refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-3xl w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5"><TypeIcon className="h-4 w-4" /> Styles</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[13rem_1fr] gap-4 max-h-[80vh]">
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
            {styleSets.map(s => (
              <StyleSetRow
                key={s.id}
                styleSet={s}
                active={s.id === (theme.styleSetId ?? defaultStyleSet.id)}
                selected={s.id === viewingId}
                onSelect={() => { setViewingId(s.id); setEditingEntryId(null); }}
                onApply={() => applyStyleSet(s)}
                onDuplicate={() => duplicateStyleSet(s)}
                onDelete={() => removeStyleSet(s)}
              />
            ))}
            <Button size="sm" variant="outline" onClick={handleNew} className="mt-1 justify-start">
              <Plus className="mr-1.5 h-4 w-4" /> New style
            </Button>
          </div>

          <div className="flex flex-col gap-1.5 overflow-y-auto pl-1">
            {viewing && (
              <>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{viewing.name}{viewing.builtin ? ' (built-in)' : ''}</p>
                  <button type="button" onClick={addEntry} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Plus className="h-3 w-3" /> Add typography
                  </button>
                </div>
                {viewing.entries.map(entry => (
                  <div key={entry.id} className={`rounded-md border ${editingEntryId === entry.id ? 'border-primary' : 'border-border'}`}>
                    <div
                      className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent"
                      onClick={() => setEditingEntryId(editingEntryId === entry.id ? null : entry.id)}
                    >
                      <EntrySummary entry={entry} palette={theme.palette} />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); deleteEntry(entry.id); }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
                        title="Delete typography"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    {editingEntryId === entry.id && (
                      <div className="border-t border-border p-2.5">
                        <div className="mb-2 flex items-center gap-1">
                          <input
                            value={entry.name}
                            onChange={e => renameEntry(entry.id, e.target.value)}
                            className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                          />
                          <button type="button" onClick={() => setEditingEntryId(null)} className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <TypographyFields
                          value={entry.typography}
                          onChange={patch => patchEntry(entry.id, patch)}
                          palette={theme.palette}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StyleLibraryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { styleSets, refresh } = useStyleLibrary();

  async function handleNew() {
    const s = createStyleSet('New style', defaultStyleSet.entries.map(e => ({ ...e, id: genId() })));
    await saveStyleSet(s);
    await refresh();
  }

  async function handleDuplicate(s: NamedStyleSet) {
    const copy = createStyleSet(`${s.name} (copy)`, s.entries.map(e => ({ ...e, id: genId() })));
    await saveStyleSet(copy);
    await refresh();
  }

  async function handleDelete(s: NamedStyleSet) {
    if (s.builtin) return;
    if (!confirm(`Delete style "${s.name}"?`)) return;
    await deleteStyleSet(s.id);
    await refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Styles</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
            {styleSets.map(s => (
              <StyleSetRow
                key={s.id}
                styleSet={s}
                onSelect={() => {}}
                onDuplicate={() => handleDuplicate(s)}
                onDelete={() => handleDelete(s)}
              />
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={handleNew} className="self-start">
            <Plus className="mr-1.5 h-4 w-4" /> New style
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

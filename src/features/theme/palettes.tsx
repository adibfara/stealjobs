import * as React from 'react';
import { Check, Copy, Lock, Palette as PaletteIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ColorField } from './ColorField';
import { defaultPalette, builtinPalettes } from './builtinPalettes';
import { getPalettes, savePalette, deletePalette, createPalette } from '@/lib/paletteStorage';
import type { ColorRole, NamedPalette, Palette, ThemeData } from '@/types/theme';

const PALETTE_LABELS: { key: ColorRole; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Muted' },
  { key: 'faint', label: 'Faint' },
  { key: 'primary', label: 'Primary' },
  { key: 'accent', label: 'Accent' },
  { key: 'border', label: 'Border' },
];

const SWATCH_KEYS: ColorRole[] = ['primary', 'accent', 'muted', 'border'];

function usePaletteLibrary() {
  const [palettes, setPalettes] = React.useState<NamedPalette[]>(builtinPalettes);
  const refresh = React.useCallback(async () => {
    const list = await getPalettes();
    setPalettes([...builtinPalettes, ...list]);
  }, []);
  React.useEffect(() => { refresh(); }, [refresh]);
  return { palettes, refresh };
}

function PaletteSwatches({ colors }: { colors: Palette }) {
  return (
    <div className="flex items-center gap-1">
      {SWATCH_KEYS.map(k => (
        <span key={k} className="h-4 w-4 rounded-full border border-border" style={{ background: colors[k] }} />
      ))}
    </div>
  );
}

interface PaletteRowProps {
  palette: NamedPalette;
  active?: boolean;
  onApply?: () => void;
  onHover?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function PaletteRow({ palette, active, onApply, onHover, onDuplicate, onDelete }: PaletteRowProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs ${active ? 'border-primary bg-primary/5' : 'border-border'} ${onApply ? 'cursor-pointer hover:bg-accent' : ''}`}
      onClick={onApply}
      onMouseEnter={onHover}
    >
      <PaletteSwatches colors={palette.colors} />
      <span className="flex-1 truncate">{palette.name}</span>
      {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDuplicate(); }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-accent"
        title="Duplicate palette"
      >
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {palette.builtin ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-muted-foreground" title="Default palette can't be deleted">
          <Lock className="h-3.5 w-3.5" />
        </span>
      ) : (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
          title="Delete palette"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

interface PalettePopoverProps {
  theme: ThemeData;
  onChange: (theme: ThemeData) => void;
}

export function PalettePopover({ theme, onChange }: PalettePopoverProps) {
  const { palettes, refresh } = usePaletteLibrary();
  const committedRef = React.useRef({ palette: theme.palette, paletteId: theme.paletteId });

  function previewPalette(p: NamedPalette) {
    onChange({ ...theme, palette: p.colors, paletteId: p.id });
  }

  function revert() {
    onChange({ ...theme, palette: committedRef.current.palette, paletteId: committedRef.current.paletteId });
  }

  function updateColor(role: ColorRole, hex: string) {
    const nextColors = { ...theme.palette, [role]: hex };
    const linked = theme.paletteId ? palettes.find(p => p.id === theme.paletteId) : null;

    if (linked && !linked.builtin) {
      const updated: NamedPalette = { ...linked, colors: nextColors };
      void savePalette(updated).then(refresh);
      committedRef.current = { palette: nextColors, paletteId: theme.paletteId };
      onChange({ ...theme, palette: nextColors });
      return;
    }

    if (linked?.builtin) {
      const forked = createPalette(`${linked.name} (copy)`, nextColors);
      void savePalette(forked).then(refresh);
      committedRef.current = { palette: nextColors, paletteId: forked.id };
      onChange({ ...theme, palette: nextColors, paletteId: forked.id });
      return;
    }

    committedRef.current = { palette: nextColors, paletteId: theme.paletteId };
    onChange({ ...theme, palette: nextColors });
  }

  function applyPalette(p: NamedPalette) {
    committedRef.current = { palette: p.colors, paletteId: p.id };
    onChange({ ...theme, palette: p.colors, paletteId: p.id });
  }

  async function duplicateCurrent() {
    const p = createPalette(`${theme.name} palette`, theme.palette);
    await savePalette(p);
    await refresh();
    committedRef.current = { palette: theme.palette, paletteId: p.id };
    onChange({ ...theme, paletteId: p.id });
  }

  async function duplicatePalette(p: NamedPalette) {
    const copy = createPalette(`${p.name} (copy)`, p.colors);
    await savePalette(copy);
    await refresh();
  }

  async function removePalette(p: NamedPalette) {
    if (p.builtin) return;
    if (!confirm(`Delete palette "${p.name}"?`)) return;
    await deletePalette(p.id);
    await refresh();
  }

  return (
    <Popover
      onOpenChange={o => {
        if (o) {
          committedRef.current = { palette: theme.palette, paletteId: theme.paletteId };
        } else {
          revert();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <PaletteIcon className="mr-1.5 h-4 w-4" /> Palette
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end" onMouseLeave={revert}>
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Current colors</p>
            <div className="flex flex-col gap-1.5">
              {PALETTE_LABELS.map(({ key, label }) => (
                <ColorField key={key} label={label} value={theme.palette[key]} onChange={hex => updateColor(key, hex)} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Saved palettes</p>
              <button type="button" onClick={duplicateCurrent} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3 w-3" /> Save as new
              </button>
            </div>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {palettes.map(p => (
                <PaletteRow
                  key={p.id}
                  palette={p}
                  active={p.id === theme.paletteId}
                  onHover={() => previewPalette(p)}
                  onApply={() => applyPalette(p)}
                  onDuplicate={() => duplicatePalette(p)}
                  onDelete={() => removePalette(p)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PaletteLibraryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { palettes, refresh } = usePaletteLibrary();

  async function handleNew() {
    const p = createPalette('New palette', defaultPalette.colors);
    await savePalette(p);
    await refresh();
  }

  async function handleDuplicate(p: NamedPalette) {
    const copy = createPalette(`${p.name} (copy)`, p.colors);
    await savePalette(copy);
    await refresh();
  }

  async function handleDelete(p: NamedPalette) {
    if (p.builtin) return;
    if (!confirm(`Delete palette "${p.name}"?`)) return;
    await deletePalette(p.id);
    await refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Palettes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
            {palettes.map(p => (
              <PaletteRow
                key={p.id}
                palette={p}
                onDuplicate={() => handleDuplicate(p)}
                onDelete={() => handleDelete(p)}
              />
            ))}
          </div>
          <Button size="sm" variant="outline" onClick={handleNew} className="self-start">
            <Plus className="mr-1.5 h-4 w-4" /> New palette
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

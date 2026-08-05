import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlignStartVertical, AlignCenterVertical, AlignEndVertical } from 'lucide-react';
import { IconPicker } from '@/features/resume/components/editor/IconPicker';
import { TypographyFields } from './TypographyFields';
import { Row } from './inspectorPrimitives';
import { PALETTE_ROLES } from './paletteRoles';
import { availableBindings, availableRepeatOptions, ancestorScope } from './themeScope';
import { findNode, nodePath, updateNode } from './themeTree';
import type { Binding, NodeKind, NodeStyle, RepeatSource, ThemeData, ThemeNode } from '@/types/theme';
import type { IconName } from '@/types/resume';

const BINDING_LABEL: Record<string, string> = {
  'resume.title': 'Resume title', 'resume.subtitle': 'Resume subtitle', 'resume.photo': 'Resume photo', 'resume.name': 'Resume name',
  'contact.icon': 'Contact icon', 'contact.text': 'Contact text',
  'section.title': 'Section title',
  'subsection.title': 'Subsection title', 'subsection.subtitle': 'Subsection subtitle', 'subsection.date': 'Subsection date', 'subsection.text': 'Subsection text',
  'bullet.text': 'Bullet text', 'tag.text': 'Tag text',
  'image.title': 'Image title', 'image.subtitle': 'Image subtitle', 'image.imageLink': 'Parent image (Images block)',
};

const IMAGE_BINDINGS: Binding[] = ['resume.photo', 'image.imageLink'];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ThemeInspector({ theme, selectedId, onChange, onSelect, onEditStyle }: {
  theme: ThemeData; selectedId: string | null; onChange: (root: ThemeNode) => void; onSelect: (id: string) => void; onEditStyle?: (entryId: string) => void;
}) {
  const node = selectedId ? findNode(theme.root, selectedId) : null;

  if (!node) {
    return <div className="p-4 text-xs text-muted-foreground">Select a node on the canvas to edit it.</div>;
  }

  const isContainer = node.kind === 'row' || node.kind === 'column' || node.kind === 'box';
  const isElement = !isContainer && node.kind !== 'image';
  const styleSet = theme.styleSet ?? [];
  const styleEntry = isElement && node.style.styleRef ? styleSet.find(e => e.id === node.style.styleRef) : undefined;
  const usesStyleRef = isElement && !!node.style.styleRef;
  const isRoot = node.id === theme.root.id;
  const path = nodePath(theme.root, node.id) ?? [node];

  function patchStyle(patch: Partial<NodeStyle>) {
    if (!node) return;
    onChange(updateNode(theme.root, node.id, { style: { ...node.style, ...patch } }));
  }

  function patchNode(patch: Partial<ThemeNode>) {
    if (!node) return;
    onChange(updateNode(theme.root, node.id, patch));
  }

  const scope = ancestorScope(theme.root, node.id);
  const repeatOptions = availableRepeatOptions(scope);
  const bindingOptions = availableBindings(scope);

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="mb-3 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs">
        {path.map((n, i) => {
          const isCurrent = n.id === node.id;
          const isNodeRoot = n.id === theme.root.id;
          if (isCurrent && !isNodeRoot) {
            return (
              <React.Fragment key={n.id}>
                {i > 0 && <span className="text-muted-foreground">/</span>}
                <input
                  value={n.name ?? ''}
                  placeholder={capitalize(n.kind)}
                  onChange={e => patchNode({ name: e.target.value || undefined })}
                  className="w-24 rounded border border-transparent bg-transparent px-1 py-0.5 font-semibold outline-none hover:border-input focus:border-input"
                />
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={n.id}>
              {i > 0 && <span className="text-muted-foreground">/</span>}
              <button
                type="button"
                onClick={() => onSelect(n.id)}
                className={
                  isCurrent
                    ? 'rounded px-1 py-0.5 font-semibold'
                    : 'rounded px-1 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              >
                {isNodeRoot ? 'Page' : (n.name || capitalize(n.kind))}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {isContainer && (
        <Row label="Container type">
          <ToggleGroup type="single" value={node.kind} onValueChange={v => v && patchNode({ kind: v as NodeKind })} className="w-full">
            <ToggleGroupItem value="row" className="flex-1 text-xs">Row</ToggleGroupItem>
            <ToggleGroupItem value="column" className="flex-1 text-xs">Column</ToggleGroupItem>
            <ToggleGroupItem value="box" className="flex-1 text-xs">Box</ToggleGroupItem>
          </ToggleGroup>
        </Row>
      )}

      {isContainer && !isRoot && (
        <Row label="Repeat over">
          <Select
            value={node.repeat ?? '__none'}
            onValueChange={v => patchNode({ repeat: v === '__none' ? undefined : (v as RepeatSource) })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">None</SelectItem>
              {repeatOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      )}

      {!isContainer && node.kind !== 'bullets' && (
        <Row label="Shows">
          <Select
            value={typeof node.binding === 'object' ? '__literal' : (node.binding ?? '__literal')}
            onValueChange={v => patchNode({ binding: v === '__literal' ? { literal: '' } : (v as Binding) })}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__literal">{node.kind === 'image' ? 'Custom URL' : 'Static text'}</SelectItem>
              {bindingOptions
                .filter((b): b is Exclude<Binding, { literal: string }> => typeof b === 'string')
                .filter(b => (node.kind === 'image' ? IMAGE_BINDINGS.includes(b) : true))
                .map(b => (
                  <SelectItem key={b} value={b}>{BINDING_LABEL[b] ?? b}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          {typeof node.binding === 'object' && (
            <input
              className="mt-1.5 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
              value={node.binding.literal}
              onChange={e => patchNode({ binding: { literal: e.target.value } })}
              placeholder={node.kind === 'image' ? 'https://…' : 'Static text…'}
            />
          )}
        </Row>
      )}

      {node.kind === 'icon' && (
        <Row label="Static icon (used when no data icon)">
          <IconPicker value={(node.style.iconName as IconName) ?? 'Link'} onChange={v => patchStyle({ iconName: v })} />
        </Row>
      )}

      {node.kind === 'image' && (
        <>
          <Row label={`Width (pt) — ${node.style.imageWidth ?? 60}`}>
            <Slider min={10} max={400} step={0.5} value={[node.style.imageWidth ?? 60]} onValueChange={([v]) => patchStyle({ imageWidth: v })} />
          </Row>
          <Row label={`Height (pt) — ${node.style.imageHeight ?? 60}`}>
            <Slider min={10} max={400} step={0.5} value={[node.style.imageHeight ?? 60]} onValueChange={([v]) => patchStyle({ imageHeight: v })} />
          </Row>
          <Row label="Shape">
            <ToggleGroup type="single" value={node.style.imageCircle ? 'circle' : 'square'} onValueChange={v => v && patchStyle({ imageCircle: v === 'circle' })} className="w-full">
              <ToggleGroupItem value="square" className="flex-1 text-xs">Square</ToggleGroupItem>
              <ToggleGroupItem value="circle" className="flex-1 text-xs">Circle</ToggleGroupItem>
            </ToggleGroup>
          </Row>
          {!node.style.imageCircle && (
            <Row label={`Corner radius (pt) — ${node.style.imageRadius ?? 0}`}>
              <Slider min={0} max={200} step={0.5} value={[node.style.imageRadius ?? 0]} onValueChange={([v]) => patchStyle({ imageRadius: v })} />
            </Row>
          )}
        </>
      )}

      {isContainer && (
        <>
          <Row label="Width">
            <ToggleGroup type="single" value={node.style.widthMode ?? 'hug'} onValueChange={v => v && patchStyle({ widthMode: v as NodeStyle['widthMode'] })} className="w-full">
              <ToggleGroupItem value="hug" className="flex-1 text-xs">Hug</ToggleGroupItem>
              <ToggleGroupItem value="fill" className="flex-1 text-xs">Fill</ToggleGroupItem>
              <ToggleGroupItem value="fixed" className="flex-1 text-xs">Fixed</ToggleGroupItem>
            </ToggleGroup>
            {node.style.widthMode === 'fixed' && (
              <Slider className="mt-2" min={10} max={400} step={1} value={[node.style.widthValue ?? 100]} onValueChange={([v]) => patchStyle({ widthValue: v })} />
            )}
          </Row>
          <Row label="Gap">
            <Slider min={0} max={40} step={1} value={[node.style.gap ?? 0]} onValueChange={([v]) => patchStyle({ gap: v })} />
          </Row>
          <Row label="Align (cross-axis)">
            <ToggleGroup type="single" value={node.style.align ?? ''} onValueChange={v => patchStyle({ align: (v || undefined) as NodeStyle['align'] })}>
              <ToggleGroupItem value="start"><AlignStartVertical className="h-3.5 w-3.5" /></ToggleGroupItem>
              <ToggleGroupItem value="center"><AlignCenterVertical className="h-3.5 w-3.5" /></ToggleGroupItem>
              <ToggleGroupItem value="end"><AlignEndVertical className="h-3.5 w-3.5" /></ToggleGroupItem>
            </ToggleGroup>
          </Row>
          <Row label="Wrap to next line">
            <Switch checked={!!node.style.wrap} onCheckedChange={v => patchStyle({ wrap: v })} />
          </Row>
        </>
      )}

      {isElement && (
        <Row label="Style">
          <Select value={node.style.styleRef ?? '__custom'} onValueChange={v => patchStyle({ styleRef: v === '__custom' ? undefined : v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__custom">Custom</SelectItem>
              {styleSet.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      )}

      {usesStyleRef && (
        <Row label="Typography (from style)">
          <div className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-xs">
            <span className="truncate">{styleEntry ? styleEntry.name : 'Style not found'}</span>
            {onEditStyle && (
              <button type="button" onClick={() => onEditStyle(node.style.styleRef!)} className="text-primary hover:underline">
                Edit style
              </button>
            )}
          </div>
        </Row>
      )}

      {isElement && !usesStyleRef && (
        <TypographyFields value={node.style} onChange={patch => patchStyle(patch)} palette={theme.palette} />
      )}

      <Row label={`Padding (pt) — ${node.style.padding?.[0] ?? 0}`}>
        <Slider min={0} max={60} step={0.1} value={[node.style.padding?.[0] ?? 0]} onValueChange={([v]) => patchStyle({ padding: [v, v, v, v] })} />
      </Row>
      <Row label={`Margin (pt) — ${node.style.margin?.[0] ?? 0}`}>
        <Slider min={0} max={60} step={0.1} value={[node.style.margin?.[0] ?? 0]} onValueChange={([v]) => patchStyle({ margin: [v, v, v, v] })} />
      </Row>

      {(isContainer || node.kind === 'image') && (
        <>
          <Row label="Background">
            <div className="flex flex-wrap gap-1">
              <button type="button" onClick={() => patchStyle({ background: undefined })} className="h-6 w-6 rounded-full border border-dashed border-border text-[8px]" title="None">✕</button>
              {PALETTE_ROLES.map(r => (
                <button key={r} type="button" onClick={() => patchStyle({ background: r })} className="h-6 w-6 rounded-full border border-border" style={{ background: theme.palette[r], outline: node.style.background === r ? '2px solid var(--primary,#2563eb)' : undefined }} title={r} />
              ))}
            </div>
          </Row>
          <Row label="Border">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-1">
                <button type="button" onClick={() => patchStyle({ border: null })} className="h-6 w-6 rounded-full border border-dashed border-border text-[8px]" title="None">✕</button>
                {PALETTE_ROLES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => patchStyle({ border: { width: node.style.border?.width ?? 1, style: node.style.border?.style ?? 'solid', color: r } })}
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ background: theme.palette[r], outline: node.style.border && node.style.border.color === r ? '2px solid var(--primary,#2563eb)' : undefined }}
                    title={r}
                  />
                ))}
              </div>
              {node.style.border && (
                <>
                  <Slider min={0.5} max={8} step={0.5} value={[node.style.border.width]} onValueChange={([v]) => patchStyle({ border: { ...node.style.border!, width: v } })} />
                  <ToggleGroup type="single" value={node.style.border.style} onValueChange={v => v && patchStyle({ border: { ...node.style.border!, style: v as 'solid' | 'dashed' | 'dotted' } })} className="w-full">
                    <ToggleGroupItem value="solid" className="flex-1 text-xs">Solid</ToggleGroupItem>
                    <ToggleGroupItem value="dashed" className="flex-1 text-xs">Dashed</ToggleGroupItem>
                    <ToggleGroupItem value="dotted" className="flex-1 text-xs">Dotted</ToggleGroupItem>
                  </ToggleGroup>
                </>
              )}
            </div>
          </Row>
        </>
      )}
      {node.kind !== 'image' && (
        <Row label={`Corner radius (pt) — ${node.style.borderRadius ?? 0}`}>
          <Slider min={0} max={50} step={0.1} value={[node.style.borderRadius ?? 0]} onValueChange={([v]) => patchStyle({ borderRadius: v })} />
        </Row>
      )}
    </div>
  );
}

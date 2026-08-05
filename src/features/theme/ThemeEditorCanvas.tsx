import * as React from 'react';
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  Rows3, Columns3, Square, Type, Image as ImageIcon, List, Smile,
} from 'lucide-react';
import { LinkedText, TemplateIcon } from '@/features/resume/components/templates/shared';
import { nodeStyleToCss, resolveColor, imageDimensionStyle } from './nodeStyleToCss';
import {
  resolveBinding, resolveCollection, extendScope, evalCondition, type Scope,
} from './resolve';
import { createNode, insertAt, moveNodeAt } from './themeTree';
import type { NodeKind, ThemeData, ThemeNode } from '@/types/theme';
import { cn } from '@/lib/utils';

const TOOL_ITEMS: { kind: NodeKind; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { kind: 'row', label: 'Row', Icon: Rows3 },
  { kind: 'column', label: 'Column', Icon: Columns3 },
  { kind: 'box', label: 'Box', Icon: Square },
  { kind: 'text', label: 'Text', Icon: Type },
  { kind: 'image', label: 'Image', Icon: ImageIcon },
  { kind: 'bullets', label: 'Bullets', Icon: List },
  { kind: 'icon', label: 'Icon', Icon: Smile },
];

function ToolButton({ kind, label, Icon }: { kind: NodeKind; label: string; Icon: React.ComponentType<{ className?: string }> }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tool:${kind}`,
    data: { type: 'new', kind },
  });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      className={cn(
        'flex flex-col items-center gap-1 rounded-md border border-input bg-background px-2 py-2 text-[11px] hover:bg-accent',
        isDragging && 'opacity-40'
      )}
      title={`Drag to add ${label}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function ThemeToolbar() {
  return (
    <div className="grid grid-cols-4 gap-1.5 p-3 border-b border-border">
      {TOOL_ITEMS.map(t => <ToolButton key={t.kind} {...t} />)}
    </div>
  );
}

function DropZone({ parentId, index, vertical }: { parentId: string; index: number; vertical: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `dz:${parentId}:${index}`, data: { parentId, index } });
  return (
    <div
      ref={setNodeRef}
      style={vertical ? { minHeight: 6, minWidth: 4 } : { minWidth: 6, minHeight: 4 }}
      className={cn(
        'transition-all rounded',
        isOver ? (vertical ? 'bg-primary/60 h-2' : 'bg-primary/60 w-2') : ''
      )}
    />
  );
}

interface CanvasProps {
  theme: ThemeData;
  resume: import('@/types/resume').ResumeData | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function DeleteSelectedButton({ selectedId, onDelete }: { selectedId: string | null; onDelete: () => void }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center rounded-md border border-destructive/30 px-2 py-1.5 text-[11px] text-destructive hover:bg-destructive/10 disabled:opacity-30"
      disabled={!selectedId}
      onClick={onDelete}
    >
      Delete selected
    </button>
  );
}

function EditorNode({ node, scope, theme, selectedId, onSelect, hoveredId, onHover, isRoot }: {
  node: ThemeNode; scope: Scope; theme: ThemeData; selectedId: string | null; onSelect: (id: string) => void;
  hoveredId: string | null; onHover: (id: string | null) => void; isRoot?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `node:${node.id}`,
    data: { type: 'existing', id: node.id },
    disabled: isRoot,
  });

  if (node.visibleWhen && !evalCondition(node.visibleWhen, scope)) return null;

  let effectiveScope = scope;
  if (node.repeat) {
    const collection = resolveCollection(node.repeat, scope);
    if (collection.length > 0) effectiveScope = extendScope(scope, node.repeat, collection[0]);
  }

  const css = nodeStyleToCss(node.style, theme.palette, node.kind, theme.styleSet);
  const isSelected = selectedId === node.id;
  const isHovered = hoveredId === node.id;
  const isContainer = node.kind === 'row' || node.kind === 'column' || node.kind === 'box';

  const wrapperStyle: React.CSSProperties = {
    ...css,
    outline: isSelected
      ? '1.5px solid var(--primary, #2563eb)'
      : isHovered
        ? '1.5px dashed var(--primary, #2563eb)'
        : '1px dashed transparent',
    outlineOffset: 1,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'pointer',
    position: 'relative',
    minHeight: isContainer && (node.children ?? []).length === 0 ? 20 : undefined,
    minWidth: isContainer && (node.children ?? []).length === 0 ? 20 : undefined,
  };

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect(node.id);
  }

  let content: React.ReactNode = null;
  if (node.kind === 'text') {
    const r = resolveBinding(node.binding, effectiveScope);
    content = <LinkedText text={r.text || '(empty text)'} style={undefined} />;
  } else if (node.kind === 'icon') {
    const r = resolveBinding(node.binding, effectiveScope);
    content = <TemplateIcon name={r.icon ?? node.style.iconName ?? 'Link'} size={node.style.iconSize ?? 12} />;
  } else if (node.kind === 'image') {
    const r = resolveBinding(node.binding, effectiveScope);
    const dims = imageDimensionStyle(node.style);
    content = r.src
      ? <img src={r.src} alt="" style={dims} />
      : <div style={{ ...dims, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#999' }}>img</div>;
  } else if (node.kind === 'bullets') {
    content = <div style={{ fontSize: 9, color: '#999' }}>• bullet • bullet</div>;
  }

  return (
    <div ref={setNodeRef} {...(isRoot ? {} : attributes)} {...(isRoot ? {} : listeners)} style={wrapperStyle} onClick={handleClick} data-node-id={node.id}>
      {node.repeat && (
        <span style={{ position: 'absolute', top: -14, left: 0, fontSize: 8, color: '#888', whiteSpace: 'nowrap' }}>
          ↻ {node.repeat}
        </span>
      )}
      {isContainer ? (
        <div style={{ display: 'flex', flexDirection: node.style.direction === 'row' || node.kind === 'row' ? 'row' : 'column', gap: node.style.gap ?? 4 }}>
          <DropZone parentId={node.id} index={0} vertical={node.kind !== 'row'} />
          {(node.children ?? []).map((child, i) => (
            <React.Fragment key={child.id}>
              <EditorNode node={child} scope={effectiveScope} theme={theme} selectedId={selectedId} onSelect={onSelect} hoveredId={hoveredId} onHover={onHover} />
              <DropZone parentId={node.id} index={i + 1} vertical={node.kind !== 'row'} />
            </React.Fragment>
          ))}
        </div>
      ) : content}
    </div>
  );
}

export function ThemeCanvas({ theme, resume, selectedId, onSelect, onChange, sidebar }: CanvasProps & { onChange: (root: ThemeNode) => void; sidebar?: React.ReactNode }) {
  const [activeTool, setActiveTool] = React.useState<NodeKind | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handlePointerOver(e: React.MouseEvent) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-node-id]');
    setHoveredId(el?.getAttribute('data-node-id') ?? null);
  }

  function handleDragStart(e: { active: { data: { current?: { type?: string; kind?: NodeKind } } } }) {
    if (e.active.data.current?.type === 'new') setActiveTool(e.active.data.current.kind ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTool(null);
    const { active, over } = e;
    if (!over) return;
    const dz = over.data.current as { parentId: string; index: number } | undefined;
    if (!dz) return;
    const activeData = active.data.current as { type: string; kind?: NodeKind; id?: string } | undefined;
    if (!activeData) return;

    if (activeData.type === 'new' && activeData.kind) {
      onChange(insertAt(theme.root, dz.parentId, dz.index, createNode(activeData.kind)));
    } else if (activeData.type === 'existing' && activeData.id) {
      onChange(moveNodeAt(theme.root, activeData.id, dz.parentId, dz.index));
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full min-h-0">
        {sidebar}
        <div
          className="flex-1 overflow-auto bg-muted/30 py-8 flex justify-center"
          onClick={() => onSelect('')}
          onMouseOver={handlePointerOver}
          onMouseLeave={() => setHoveredId(null)}
        >
          {resume ? (
            <div
              className="shadow-2xl"
              style={{
                maxWidth: 850, width: '100%', minHeight: 1100,
                background: resolveColor(theme.page.background, theme.palette),
                padding: `${theme.page.paddingV}pt ${theme.page.paddingH}pt`,
              }}
            >
              <EditorNode node={theme.root} scope={{ resume }} theme={theme} selectedId={selectedId} onSelect={onSelect} hoveredId={hoveredId} onHover={setHoveredId} isRoot />
            </div>
          ) : (
            <p className="p-8 text-sm text-muted-foreground">Create a resume to preview and edit this theme.</p>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeTool ? <div className="rounded-md border border-primary bg-card px-2 py-1 text-xs shadow-lg">{activeTool}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

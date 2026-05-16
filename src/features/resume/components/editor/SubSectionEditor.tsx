import * as React from 'react';
import { Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LinkedInput } from './LinkedInput';
import { genId } from '@/lib/resumeStorage';
import type { SubSection, Bullet, SubSectionType, TagsPosition, ImageItem } from '@/types/resume';
import { cn } from '@/lib/utils';

interface SubSectionEditorProps {
  subsection: SubSection;
  onChange: (s: SubSection) => void;
  onDelete: () => void;
  id?: string;
}

// ── Sortable bullet row ──────────────────────────────────────────────────────

interface SortableBulletProps {
  bullet: Bullet;
  onUpdate: (patch: Partial<Bullet>) => void;
  onRemove: () => void;
}

function SortableBullet({ bullet, onUpdate, onRemove }: SortableBulletProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: bullet.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-start gap-1.5', isDragging && 'opacity-50')}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-2 flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        tabIndex={-1}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
      <LinkedInput
        value={bullet.text}
        onChange={v => onUpdate({ text: v })}
        link={bullet.link}
        onLinkChange={v => onUpdate({ link: v })}
        placeholder="Bullet point..."
        multiline
        rows={2}
        className="flex-1"
      />
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ── Sortable tag pill ────────────────────────────────────────────────────────

interface SortableTagProps {
  tag: { id: string; text: string };
  onUpdate: (text: string) => void;
  onRemove: () => void;
}

function SortableTag({ tag, onUpdate, onRemove }: SortableTagProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tag.id });

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-0.5 rounded-full border border-border bg-muted px-1.5 py-1',
        isDragging && 'opacity-50'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
        tabIndex={-1}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <input
        ref={inputRef}
        type="text"
        value={tag.text}
        onChange={e => onUpdate(e.target.value)}
        placeholder="Tag..."
        className="bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
        style={{ width: `${Math.max(3, tag.text.length + 1)}ch` }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 text-xs text-muted-foreground/50 transition-colors hover:text-destructive"
      >
        ×
      </button>
    </div>
  );
}

// ── Sortable image row ───────────────────────────────────────────────────────

interface SortableImageProps {
  image: ImageItem;
  onUpdate: (patch: Partial<ImageItem>) => void;
  onRemove: () => void;
}

function SortableImage({ image, onUpdate, onRemove }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rounded-md border border-border bg-muted/30 p-2', isDragging && 'opacity-50')}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className="flex-1 text-xs font-medium text-muted-foreground truncate">{image.title || 'Image'}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div>
          <label className="mb-0.5 block text-xs text-muted-foreground">Title</label>
          <input
            type="text"
            value={image.title}
            onChange={e => onUpdate({ title: e.target.value })}
            placeholder="Project name..."
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-muted-foreground">Subtitle</label>
          <input
            type="text"
            value={image.subtitle ?? ''}
            onChange={e => onUpdate({ subtitle: e.target.value })}
            placeholder="★ 120 · 2k views..."
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-muted-foreground">Image URL</label>
          <input
            type="text"
            value={image.imageLink}
            onChange={e => onUpdate({ imageLink: e.target.value })}
            placeholder="https://..."
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs text-muted-foreground">Link (optional)</label>
          <input
            type="text"
            value={image.link ?? ''}
            onChange={e => onUpdate({ link: e.target.value })}
            placeholder="https://..."
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

// ── Main editor ──────────────────────────────────────────────────────────────

export function SubSectionEditor({ subsection, onChange, onDelete, id }: SubSectionEditorProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const {
    attributes: sortableAttrs,
    listeners: sortableListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id ?? subsection.id });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function update(patch: Partial<SubSection>) {
    onChange({ ...subsection, ...patch });
  }

  // Bullets ──────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    const bullets = subsection.bullets;
    if (bullets.length > 0 && bullets[bullets.length - 1].text !== '') {
      update({ bullets: [...bullets, { id: genId(), text: '' }] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsection.bullets]);

  function updateBullet(id: string, patch: Partial<Bullet>) {
    update({ bullets: subsection.bullets.map(b => b.id === id ? { ...b, ...patch } : b) });
  }

  function removeBullet(id: string) {
    update({ bullets: subsection.bullets.filter(b => b.id !== id) });
  }

  function onBulletDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const ids = subsection.bullets.map(b => b.id);
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      update({ bullets: arrayMove(subsection.bullets, from, to) });
    }
  }

  // Tags ─────────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    const tags = subsection.tags;
    if (tags.length > 0 && tags[tags.length - 1].text !== '') {
      update({ tags: [...tags, { id: genId(), text: '' }] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsection.tags]);

  function updateTagText(id: string, text: string) {
    update({ tags: subsection.tags.map(t => t.id === id ? { ...t, text } : t) });
  }

  function removeTag(id: string) {
    update({ tags: subsection.tags.filter(t => t.id !== id) });
  }

  function onTagDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const ids = subsection.tags.map(t => t.id);
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      update({ tags: arrayMove(subsection.tags, from, to) });
    }
  }

  // Images ───────────────────────────────────────────────────────────────────

  function addImage() {
    update({ images: [...(subsection.images ?? []), { id: genId(), title: '', imageLink: '' }] });
  }

  function updateImage(id: string, patch: Partial<ImageItem>) {
    update({ images: (subsection.images ?? []).map(img => img.id === id ? { ...img, ...patch } : img) });
  }

  function removeImage(id: string) {
    update({ images: (subsection.images ?? []).filter(img => img.id !== id) });
  }

  function onImageDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const images = subsection.images ?? [];
      const ids = images.map(img => img.id);
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      update({ images: arrayMove(images, from, to) });
    }
  }

  // Ensure at least one bullet/tag row exists when section is expanded
  React.useEffect(() => {
    if (!collapsed) {
      let updated = { ...subsection };
      let changed = false;
      if (subsection.bullets.length === 0) {
        const id = genId();
        updated.bullets = [{ id, text: '' }];
        changed = true;
      }
      if (subsection.tags.length === 0) {
        const id = genId();
        updated.tags = [{ id, text: '' }];
        changed = true;
      }
      if (changed) onChange(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rounded-lg border border-border bg-background', isDragging && 'opacity-50')}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          {...sortableAttrs}
          {...sortableListeners}
          className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          }
          <span className="truncate text-sm font-medium text-foreground">
            {subsection.title || <span className="text-muted-foreground italic">Untitled</span>}
          </span>
        </button>

        {/* Type selector */}
        <div className="flex gap-0.5 shrink-0">
          {([1, 2, 3] as SubSectionType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => update({ type: t })}
              className={cn(
                'h-6 w-7 rounded text-xs font-semibold transition-colors',
                subsection.type === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              T{t}
            </button>
          ))}
        </div>

        {/* Tags position toggle */}
        <div className="flex gap-0.5 shrink-0">
          {(['top', 'bottom'] as TagsPosition[]).map(pos => (
            <button
              key={pos}
              type="button"
              title={`Tags ${pos}`}
              onClick={() => update({ tagsPosition: pos })}
              className={cn(
                'h-6 rounded px-1.5 text-xs font-semibold transition-colors',
                (subsection.tagsPosition ?? 'bottom') === pos
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {pos === 'top' ? '↑T' : 'T↓'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-3 border-t border-border px-3 pb-3 pt-3">
          {/* Core fields */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
              <LinkedInput
                value={subsection.title ?? ''}
                onChange={v => update({ title: v })}
                link={subsection.titleLink}
                onLinkChange={v => update({ titleLink: v })}
                placeholder="Position / project / degree..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Subtitle</label>
              <LinkedInput
                value={subsection.subtitle ?? ''}
                onChange={v => update({ subtitle: v })}
                link={subsection.subtitleLink}
                onLinkChange={v => update({ subtitleLink: v })}
                placeholder="Company / institution..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
            <LinkedInput
              value={subsection.date ?? ''}
              onChange={v => update({ date: v })}
              link={subsection.dateLink}
              onLinkChange={v => update({ dateLink: v })}
              placeholder="Jan 2022 – Present"
            />
          </div>

          {/* Text */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Text</label>
            <textarea
              value={subsection.text ?? ''}
              onChange={e => update({ text: e.target.value })}
              placeholder="Optional paragraph text..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              style={{ textAlign: 'justify' }}
            />
          </div>

          {/* Bullets */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bullets</label>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onBulletDragEnd}>
              <SortableContext items={subsection.bullets.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-1.5">
                  {subsection.bullets.map(bullet => (
                    <SortableBullet
                      key={bullet.id}
                      bullet={bullet}
                      onUpdate={patch => updateBullet(bullet.id, patch)}
                      onRemove={() => removeBullet(bullet.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tags</label>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onTagDragEnd}>
              <SortableContext items={subsection.tags.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-wrap gap-1.5">
                  {subsection.tags.map(tag => (
                    <SortableTag
                      key={tag.id}
                      tag={tag}
                      onUpdate={text => updateTagText(tag.id, text)}
                      onRemove={() => removeTag(tag.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Images */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Images</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={subsection.imagesCardView ?? false}
                    onChange={e => update({ imagesCardView: e.target.checked })}
                    className="h-3 w-3 rounded"
                  />
                  Card view
                </label>
                <button
                  type="button"
                  onClick={addImage}
                  className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onImageDragEnd}>
              <SortableContext items={(subsection.images ?? []).map(img => img.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {(subsection.images ?? []).map(img => (
                    <SortableImage
                      key={img.id}
                      image={img}
                      onUpdate={patch => updateImage(img.id, patch)}
                      onRemove={() => removeImage(img.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  );
}

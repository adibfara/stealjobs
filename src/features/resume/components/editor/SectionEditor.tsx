import * as React from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { LinkedInput } from './LinkedInput';
import { SubSectionEditor } from './SubSectionEditor';
import { genId } from '@/lib/resumeStorage';
import type { Section, SubSection } from '@/types/resume';

function createSubSection(): SubSection {
  return {
    id: genId(),
    title: '',
    subtitle: '',
    date: '',
    bullets: [{ id: genId(), text: '' }],
    tags: [{ id: genId(), text: '' }],
    type: 1,
  };
}

interface SectionEditorProps {
  section: Section;
  onChange: (s: Section) => void;
  onDelete: () => void;
  index: number;
}

export function SectionEditor({ section, onChange, onDelete, index }: SectionEditorProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function update(patch: Partial<Section>) {
    onChange({ ...section, ...patch });
  }

  function addSubSection() {
    update({ subsections: [...section.subsections, createSubSection()] });
  }

  function updateSubSection(id: string, s: SubSection) {
    update({ subsections: section.subsections.map(ss => ss.id === id ? s : ss) });
  }

  function removeSubSection(id: string) {
    update({ subsections: section.subsections.filter(ss => ss.id !== id) });
  }

  function onSubSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const ids = section.subsections.map(ss => ss.id);
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      update({ subsections: arrayMove(section.subsections, from, to) });
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-border bg-card shadow-sm${isDragging ? ' opacity-50' : ''}`}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          }
          <span className="font-semibold truncate">
            {section.title || <span className="text-muted-foreground font-normal italic">Untitled Section</span>}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {section.subsections.length} item{section.subsections.length !== 1 ? 's' : ''}
          </span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-4 border-t border-border px-4 pb-4 pt-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Section Title
            </label>
            <LinkedInput
              value={section.title ?? ''}
              onChange={v => update({ title: v })}
              link={section.titleLink}
              onLinkChange={v => update({ titleLink: v })}
              placeholder="Experience, Education, Projects, Skills..."
            />
          </div>

          {/* Subsections */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entries
            </label>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSubSectionDragEnd}>
              <SortableContext items={section.subsections.map(ss => ss.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {section.subsections.map(ss => (
                    <SubSectionEditor
                      key={ss.id}
                      id={ss.id}
                      subsection={ss}
                      onChange={s => updateSubSection(ss.id, s)}
                      onDelete={() => removeSubSection(ss.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Button variant="outline" size="sm" onClick={addSubSection} className="self-start gap-1.5">
              <Plus className="h-4 w-4" /> Add Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

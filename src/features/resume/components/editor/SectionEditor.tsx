import * as React from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
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
    bullets: [],
    tags: [],
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

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
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
            {section.subsections.map(ss => (
              <SubSectionEditor
                key={ss.id}
                subsection={ss}
                onChange={s => updateSubSection(ss.id, s)}
                onDelete={() => removeSubSection(ss.id)}
              />
            ))}
            <Button variant="outline" size="sm" onClick={addSubSection} className="self-start gap-1.5">
              <Plus className="h-4 w-4" /> Add Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import * as React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  ArrowLeft, Eye, Download, Plus, Save, Pencil, Check, X,
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { ContactEditor } from './editor/ContactEditor';
import { SectionEditor } from './editor/SectionEditor';
import { LinkedInput } from './editor/LinkedInput';
import {
  getResume, saveResume, exportResumeAsJson, genId,
} from '@/lib/resumeStorage';
import type { ResumeData, Section } from '@/types/resume';

function createSection(): Section {
  return { id: genId(), title: '', subsections: [] };
}

function useDebouncedSave(resume: ResumeData | null, delay = 400) {
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!resume) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveResume(resume), delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [resume, delay]);
}

export function ResumeEditorPage() {
  const { resumeId } = useParams({ from: '/resume/$resumeId' });
  const navigate = useNavigate();
  const [resume, setResume] = React.useState<ResumeData | null>(null);
  const [editingName, setEditingName] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState('');
  const [saved, setSaved] = React.useState(false);

  useDebouncedSave(resume);

  // Flash "saved" indicator after each save
  React.useEffect(() => {
    if (!resume) return;
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [resume]);

  React.useEffect(() => {
    const r = getResume(resumeId);
    if (!r) {
      navigate({ to: '/' });
      return;
    }
    setResume(r);
  }, [resumeId]);

  function update(patch: Partial<ResumeData>) {
    setResume(prev => prev ? { ...prev, ...patch } : prev);
  }

  function addSection() {
    if (!resume) return;
    update({ sections: [...resume.sections, createSection()] });
  }

  function updateSection(id: string, s: Section) {
    if (!resume) return;
    update({ sections: resume.sections.map(sec => sec.id === id ? s : sec) });
  }

  function removeSection(id: string) {
    if (!resume) return;
    update({ sections: resume.sections.filter(sec => sec.id !== id) });
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!resume || !over || active.id === over.id) return;
    const ids = resume.sections.map(s => s.id);
    update({ sections: arrayMove(resume.sections, ids.indexOf(active.id as string), ids.indexOf(over.id as string)) });
  }

  function commitName() {
    if (!resume) return;
    update({ name: nameDraft.trim() || resume.name });
    setEditingName(false);
  }

  if (!resume) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Resume name */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {editingName ? (
              <div className="flex flex-1 items-center gap-1.5">
                <input
                  autoFocus
                  type="text"
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="flex-1 rounded-md border border-input bg-background px-2.5 py-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                />
                <button type="button" onClick={commitName} className="flex h-7 w-7 items-center justify-center rounded text-green-600 hover:bg-green-50">
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditingName(false)} className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setNameDraft(resume.name); setEditingName(true); }}
                className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-accent group"
              >
                <span className="font-semibold truncate">{resume.name}</span>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Saved indicator */}
          <span className={`text-xs text-muted-foreground transition-opacity ${saved ? 'opacity-100' : 'opacity-0'}`}>
            Saved
          </span>

          <Button variant="outline" size="sm" onClick={() => exportResumeAsJson(resume)}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>

          <Button
            size="sm"
            onClick={() => {
              saveResume(resume);
              navigate({ to: '/resume/$resumeId/preview', params: { resumeId: resume.id } });
            }}
          >
            <Eye className="mr-1.5 h-4 w-4" /> Preview
          </Button>
        </div>
      </header>

      {/* Editor body */}
      <main className="mx-auto px-4 py-6 pb-20">
        <div className="flex flex-col gap-5 w-200 mx-auto">

          {/* Identity section */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Identity
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name / Title</label>
                <LinkedInput
                  value={resume.title ?? ''}
                  onChange={v => update({ title: v })}
                  link={resume.titleLink}
                  onLinkChange={v => update({ titleLink: v })}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Subtitle / Role</label>
                <LinkedInput
                  value={resume.subtitle ?? ''}
                  onChange={v => update({ subtitle: v })}
                  link={resume.subtitleLink}
                  onLinkChange={v => update({ subtitleLink: v })}
                  placeholder="Software Engineer · Open to opportunities"
                />
              </div>
            </div>
          </section>

          {/* Contacts section */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Contacts
            </h2>
            <ContactEditor
              contacts={resume.contacts}
              onChange={contacts => update({ contacts })}
            />
          </section>

          {/* Sections */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
            <SortableContext items={resume.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-5">
                {resume.sections.map((section, idx) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    index={idx}
                    onChange={s => updateSection(section.id, s)}
                    onDelete={() => removeSection(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add section */}
          <button
            type="button"
            onClick={addSection}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Add Section
          </button>
        </div>
      </main>
    </div>
  );
}

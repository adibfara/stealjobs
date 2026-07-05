import * as React from 'react';
import { Plus, Trash2, Pencil, Search, ChevronDown, ChevronRight, GripVertical, X, Briefcase, Upload, Download, Tags as TagsIcon, MoreHorizontal } from 'lucide-react';
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  getExperiences, saveExperience, saveExperienceOrder, deleteExperience, createExperience,
  getAllTags, getAllCompanies, exportExperiencesAsJson, getFavoriteTags, saveFavoriteTags,
} from '@/lib/experienceStorage';
import type { ExperienceData } from '@/types/experience';
import { cn } from '@/lib/utils';

// ── TagInput: free-text + searchable existing tags ────────────────────────────

function TagInput({
  tags,
  onChange,
  suggestions,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [input, setInput] = React.useState('');
  const rootRef = React.useRef<HTMLDivElement>(null);

  function addTag(t: string) {
    const trimmed = t.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  }

  function removeTag(t: string) {
    onChange(tags.filter(x => x !== t));
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex min-h-9 w-full items-center rounded-md border border-input bg-background px-2 py-1.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(input); }
          }}
          placeholder="Add tags…"
          className="min-w-[80px] w-full flex-1 bg-transparent text-sm outline-none"
        />
      </div>
      {(suggestions.length > 0 || tags.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from(new Set([...suggestions, ...tags])).map(s => {
            const selected = tags.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => (selected ? removeTag(s) : addTag(s))}
                className={
                  selected
                    ? 'rounded-sm bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground'
                    : 'rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-accent'
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CGARL list fields (Context/Goal/Action/Result/Learning) ──────────────────

const CGARL_FIELDS = [
  { key: 'context', emoji: '🎯', label: 'Context' },
  { key: 'goal', emoji: '🚀', label: 'Goal' },
  { key: 'action', emoji: '🔧', label: 'Action' },
  { key: 'result', emoji: '📈', label: 'Result' },
  { key: 'learning', emoji: '💡', label: 'Learning' },
] as const;

type CgarlKey = typeof CGARL_FIELDS[number]['key'];

function ListField({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = React.useState('');

  function addItem() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setInput('');
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); addItem(); }
        }}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {items.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span key={i} className="flex max-w-full items-center gap-1.5 rounded-full border border-primary px-2.5 py-1 text-xs font-medium text-primary">
              <span className="whitespace-pre-wrap">{it}</span>
              <button type="button" onClick={() => removeItem(i)} className="shrink-0 text-primary/80 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ExperienceForm (shared Add/Edit) ──────────────────────────────────────────

interface ExpFormState {
  title: string;
  company: string;
  tags: string[];
  context: string[];
  goal: string[];
  action: string[];
  result: string[];
  learning: string[];
  description: string;
}

function ExperienceForm({
  state,
  onChange,
  tagSuggestions,
}: {
  state: ExpFormState;
  onChange: (patch: Partial<ExpFormState>) => void;
  tagSuggestions: string[];
}) {
  const inputCls = 'flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';
  const labelCls = 'mb-1 block text-sm font-medium';
  return (
    <div className="grid gap-3">
      <div>
        <label className={labelCls}>Title <span className="text-destructive">*</span></label>
        <input className={inputCls} value={state.title} onChange={e => onChange({ title: e.target.value })} placeholder="e.g. Led migration to microservices" />
      </div>
      <div>
        <label className={labelCls}>Company</label>
        <input className={inputCls} value={state.company} onChange={e => onChange({ company: e.target.value })} placeholder="e.g. Acme Corp" />
      </div>
      <div>
        <label className={labelCls}>Tags</label>
        <TagInput tags={state.tags} onChange={t => onChange({ tags: t })} suggestions={tagSuggestions} />
      </div>
      {CGARL_FIELDS.map(f => (
        <div key={f.key}>
          <label className={labelCls}>{f.emoji} {f.label}</label>
          <ListField
            items={state[f.key]}
            onChange={items => onChange({ [f.key]: items } as Partial<ExpFormState>)}
            placeholder={`Add ${f.label.toLowerCase()}, press Enter…`}
          />
        </div>
      ))}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          value={state.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="What happened, what you did, what the outcome was…"
        />
      </div>
    </div>
  );
}

function AddDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (exp: ExperienceData) => void;
}) {
  const [title, setTitle] = React.useState('');
  const [company, setCompany] = React.useState('TAPSI');
  const inputCls = 'flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';
  const labelCls = 'mb-1 block text-sm font-medium';

  React.useEffect(() => { if (open) { setTitle(''); setCompany('TAPSI'); } }, [open]);

  function handleSave() {
    if (!title.trim()) return;
    const base = createExperience();
    onSave({ ...base, title: title.trim(), company });
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New experience</DialogTitle>
          <DialogDescription>Capture a story you can use in interviews.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <label className={labelCls}>Title <span className="text-destructive">*</span></label>
            <input
              autoFocus
              className={inputCls}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
              placeholder="e.g. Led migration to microservices"
            />
          </div>
          <div>
            <label className={labelCls}>Company</label>
            <input
              className={inputCls}
              value={company}
              onChange={e => setCompany(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  exp,
  onClose,
  onSave,
  tagSuggestions,
}: {
  exp: ExperienceData | null;
  onClose: () => void;
  onSave: (exp: ExperienceData) => void;
  tagSuggestions: string[];
}) {
  const [form, setForm] = React.useState<ExpFormState>({
    title: '', company: '', tags: [],
    context: [], goal: [], action: [], result: [], learning: [],
    description: '',
  });
  const skipAutosave = React.useRef(true);

  React.useEffect(() => {
    if (!exp) return;
    skipAutosave.current = true;
    setForm({
      title: exp.title, company: exp.company, tags: exp.tags,
      context: exp.context, goal: exp.goal, action: exp.action, result: exp.result, learning: exp.learning,
      description: exp.description,
    });
  }, [exp]);

  React.useEffect(() => {
    if (skipAutosave.current) { skipAutosave.current = false; return; }
    if (!exp || !form.title.trim()) return;
    const timeout = setTimeout(() => {
      onSave({ ...exp, ...form, title: form.title.trim(), lastModified: Date.now() });
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  if (!exp) return null;

  return (
    <Dialog open={!!exp} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit experience</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <ExperienceForm state={form} onChange={p => setForm(f => ({ ...f, ...p }))} tagSuggestions={tagSuggestions} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── ImportDialog ──────────────────────────────────────────────────────────────

function ImportDialog({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (experiences: ExperienceData[]) => void;
}) {
  const [raw, setRaw] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => { if (open) { setRaw(''); setError(''); } }, [open]);

  function handleImport() {
    try {
      const parsed = JSON.parse(raw) as Partial<ExperienceData>[];
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
      const experiences: ExperienceData[] = parsed.map(item => {
        if (!item.title) throw new Error('Each item must have a "title" field');
        const base = createExperience();
        return {
          ...base,
          id: item.id ?? base.id,
          title: item.title,
          company: item.company ?? '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          context: Array.isArray(item.context) ? item.context : [],
          goal: Array.isArray(item.goal) ? item.goal : [],
          action: Array.isArray(item.action) ? item.action : [],
          result: Array.isArray(item.result) ? item.result : [],
          learning: Array.isArray(item.learning) ? item.learning : [],
          description: item.description ?? '',
          order: item.order ?? base.order,
          createdAt: item.createdAt ?? base.createdAt,
          lastModified: item.lastModified ?? Date.now(),
        };
      });
      onImport(experiences);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import experiences</DialogTitle>
          <DialogDescription>
            Paste a JSON array. Each item: <code className="text-xs bg-muted px-1 rounded">{'{ title, company?, tags?, context?, goal?, action?, result?, learning?, description? }'}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <textarea
            className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring resize-none"
            value={raw}
            onChange={e => { setRaw(e.target.value); setError(''); }}
            placeholder={'[\n  { "title": "Fixed prod outage", "company": "Acme", "tags": ["incident"], "description": "..." }\n]'}
          />
          {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!raw.trim()}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── TagsDialog ──────────────────────────────────────────────────────────────

function TagsDialog({
  open,
  onClose,
  allTags,
  favoriteTags,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  allTags: string[];
  favoriteTags: string[];
  onToggle: (t: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Favorite tags</DialogTitle>
          <DialogDescription>Select tags to pin them at the top and highlight them.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {allTags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {[...allTags].sort((a, b) => a.localeCompare(b)).map(t => {
                const isSelected = favoriteTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onToggle(t)}
                    className={cn(
                      'rounded-full border-2 px-2.5 py-1 text-xs font-medium',
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── ExperienceCard ─────────────────────────────────────────────────────────────

function ExperienceCard({
  exp,
  onEdit,
  onDelete,
  sortable,
  favoriteTags,
}: {
  exp: ExperienceData;
  onEdit: (exp: ExperienceData) => void;
  onDelete: (id: string) => void;
  sortable: boolean;
  favoriteTags: string[];
}) {
  const [expanded, setExpanded] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exp.id, disabled: !sortable });

  const cgarlJoined = CGARL_FIELDS
    .filter(f => exp[f.key].length > 0)
    .map(f => `${f.emoji} ${exp[f.key].slice(0, 2).join(', ')}`)
    .join(', ');

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group rounded-xl border border-border bg-card p-2.5 shadow-sm transition-all hover:border-primary/30',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-start gap-2">
        {sortable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-0.5 flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(exp)}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-tight truncate">{exp.title}</h3>
            {exp.tags.length > 0 && (
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                {[...exp.tags]
                  .sort((a, b) => Number(favoriteTags.includes(b)) - Number(favoriteTags.includes(a)))
                  .map(t => (
                    <span
                      key={t}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-xs text-muted-foreground',
                        favoriteTags.includes(t) ? 'border-amber-500' : 'border-transparent bg-muted'
                      )}
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </div>
          {!expanded && cgarlJoined && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
              {cgarlJoined}
            </p>
          )}
          {expanded && (
            <div className="mt-2.5 space-y-1.5">
              {CGARL_FIELDS.map(f => exp[f.key].length > 0 && (
                <div key={f.key} className="text-sm text-muted-foreground">
                  {exp[f.key].map((it, i) => (
                    <p key={i}>{f.emoji} {it}</p>
                  ))}
                </div>
              ))}
              {exp.description && (
                <p className="whitespace-pre-wrap">{exp.description}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onEdit(exp); }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(exp.id); }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ExperiencesSection (main export) ──────────────────────────────────────────

export function ExperiencesSection() {
  const [experiences, setExperiences] = React.useState<ExperienceData[]>([]);
  const [search, setSearch] = React.useState('');
  const [tagFilters, setTagFilters] = React.useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);
  const [editExp, setEditExp] = React.useState<ExperienceData | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [tagsOpen, setTagsOpen] = React.useState(false);
  const [favoriteTags, setFavoriteTags] = React.useState<string[]>([]);

  React.useEffect(() => { setExperiences(getExperiences()); setFavoriteTags(getFavoriteTags()); }, []);

  function refresh() { setExperiences(getExperiences()); }

  const allTags = getAllTags();
  const allCompanies = getAllCompanies();

  const filtersApplied = search.trim() !== '' || tagFilters.length > 0 || companyFilter !== '';

  const filtered = experiences.filter(e => {
    if (companyFilter && e.company !== companyFilter) return false;
    if (tagFilters.length > 0 && !tagFilters.every(t => e.tags.includes(t))) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [e.title, e.company, e.description, ...e.tags].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  function clearFilters() {
    setSearch('');
    setTagFilters([]);
    setCompanyFilter('');
  }

  function handleSaveNew(exp: ExperienceData) {
    saveExperience(exp);
    refresh();
    setAddOpen(false);
    setEditExp(exp);
  }

  function handleSaveEdit(exp: ExperienceData) {
    saveExperience(exp);
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this experience?')) return;
    deleteExperience(id);
    refresh();
  }

  function handleImport(imported: ExperienceData[]) {
    imported.forEach(e => saveExperience(e));
    refresh();
    setImportOpen(false);
  }

  function handleExport() {
    exportExperiencesAsJson(experiences);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const ids = experiences.map(e => e.id);
      const from = ids.indexOf(active.id as string);
      const to = ids.indexOf(over.id as string);
      const reordered = arrayMove(experiences, from, to);
      setExperiences(reordered);
      saveExperienceOrder(reordered);
    }
  }

  function toggleTagFilter(t: string) {
    setTagFilters(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  const hasAny = experiences.length > 0;

  return (
    <div className="mb-10">
      {!hasAny ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No experiences yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Capture stories for interview questions like "what's your biggest challenge?"</p>
          <div className="mt-5 flex gap-2">
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add first
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="mr-1.5 h-4 w-4" /> Import
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title, company, tags, description…"
                className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="flex h-9 w-40 shrink-0 truncate rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All companies</option>
              {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <Button size="sm" className="h-9" onClick={() => setAddOpen(true)} title="New Experience">
              <Plus className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTagsOpen(true)}>
                  <TagsIcon className="mr-1.5 h-4 w-4" /> Tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-1.5 h-4 w-4" /> Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportOpen(true)}>
                  <Upload className="mr-1.5 h-4 w-4" /> Import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {allTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {[...allTags]
                .sort((a, b) => {
                  const favDiff = Number(favoriteTags.includes(b)) - Number(favoriteTags.includes(a));
                  return favDiff !== 0 ? favDiff : a.localeCompare(b);
                })
                .map(t => {
                  const isFav = favoriteTags.includes(t);
                  const isActive = tagFilters.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTagFilter(t)}
                      className={cn(
                        'rounded-full border-2 px-2 py-0.5 text-xs',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isFav
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'
                          : 'border-border bg-muted text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
            </div>
          )}

          {filtersApplied && (
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Reordering disabled while filters are applied.</p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3.5 w-3.5" /> Clear filters
              </Button>
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No experiences match your filters.</p>
          ) : filtersApplied ? (
            <div className="grid gap-3">
              {filtered.map(exp => (
                <ExperienceCard key={exp.id} exp={exp} onEdit={setEditExp} onDelete={handleDelete} sortable={false} favoriteTags={favoriteTags} />
              ))}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={experiences.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div className="grid gap-3">
                  {experiences.map(exp => (
                    <ExperienceCard key={exp.id} exp={exp} onEdit={setEditExp} onDelete={handleDelete} sortable favoriteTags={favoriteTags} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}

      <AddDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={handleSaveNew} />
      <EditDialog exp={editExp} onClose={() => setEditExp(null)} onSave={handleSaveEdit} tagSuggestions={allTags} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      <TagsDialog
        open={tagsOpen}
        onClose={() => setTagsOpen(false)}
        allTags={allTags}
        favoriteTags={favoriteTags}
        onToggle={t => {
          const next = favoriteTags.includes(t) ? favoriteTags.filter(x => x !== t) : [...favoriteTags, t];
          saveFavoriteTags(next);
          setFavoriteTags(next);
        }}
      />
    </div>
  );
}

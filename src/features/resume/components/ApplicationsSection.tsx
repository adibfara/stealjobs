import * as React from 'react';
import {
  Plus, Trash2, Pencil, Search, Upload, ClipboardCopy, Download, ExternalLink, Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  getApplications, saveApplication, deleteApplication, createApplication,
} from '@/lib/applicationStorage';
import type { ApplicationCountry, ApplicationData, ApplicationImport, ApplicationStage } from '@/types/application';
import type { ResumeData } from '@/types/resume';

// ── constants ────────────────────────────────────────────────────────────────

const STAGE_ORDER: ApplicationStage[] = ['offer', 'in_progress', 'applied', 'rejected'];

const COUNTRIES: ApplicationCountry[] = ['Netherlands', 'Germany', 'UAE'];
const COUNTRY_FLAG: Record<ApplicationCountry, string> = { Netherlands: '🇳🇱', Germany: '🇩🇪', UAE: '🇦🇪' };

const STAGE_LABEL: Record<ApplicationStage, string> = {
  offer: 'Offer',
  in_progress: 'In Progress',
  applied: 'Applied',
  rejected: 'Rejected',
};

const STAGE_COLORS: Record<ApplicationStage, { bg: string; text: string; bar: string }> = {
  offer:       { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', bar: '#10b981' },
  in_progress: { bg: 'bg-sky-100 dark:bg-sky-900/40',         text: 'text-sky-700 dark:text-sky-300',         bar: '#0ea5e9' },
  applied:     { bg: 'bg-amber-100 dark:bg-amber-900/40',     text: 'text-amber-700 dark:text-amber-300',     bar: '#f59e0b' },
  rejected:    { bg: 'bg-red-100 dark:bg-red-900/30',         text: 'text-red-700 dark:text-red-300',         bar: '#ef4444' },
};

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function buildAsciiChart(apps: ApplicationData[]): string {
  const total = apps.length;
  if (total === 0) return 'No applications yet.';
  const BAR = 20;
  const lines: string[] = [`Job Applications (${total} total)`, '═'.repeat(34)];
  for (const stage of STAGE_ORDER) {
    const count = apps.filter(a => a.stage === stage).length;
    if (count === 0) continue;
    const pct = Math.round((count / total) * 100);
    const filled = Math.round((count / total) * BAR);
    const bar = '█'.repeat(filled) + '░'.repeat(BAR - filled);
    const label = STAGE_LABEL[stage].padEnd(12);
    lines.push(`${label} ${bar}  ${count} (${pct}%)`);
  }
  return lines.join('\n');
}

// ── MiniChart ────────────────────────────────────────────────────────────────

function MiniChart({ apps }: { apps: ApplicationData[] }) {
  const total = apps.length;
  if (total === 0) return null;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      {STAGE_ORDER.map(stage => {
        const count = apps.filter(a => a.stage === stage).length;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={stage}
            style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[stage].bar }}
            title={`${STAGE_LABEL[stage]}: ${count}`}
          />
        );
      })}
    </div>
  );
}

// ── ApplicationCard ──────────────────────────────────────────────────────────

const QUICK_ACTIONS: Partial<Record<ApplicationStage, ApplicationStage[]>> = {
  applied:     ['in_progress', 'rejected'],
  in_progress: ['rejected'],
};

function ApplicationCard({
  app,
  onEdit,
  onDelete,
  onStageChange,
}: {
  app: ApplicationData;
  onEdit: (app: ApplicationData) => void;
  onDelete: (id: string) => void;
  onStageChange: (app: ApplicationData, stage: ApplicationStage) => void;
}) {
  const colors = STAGE_COLORS[app.stage];
  const quickActions = QUICK_ACTIONS[app.stage] ?? [];
  return (
    <div className="group relative cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
      onClick={() => onEdit(app)}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {app.link && (
            <a
              href={app.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Open link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onEdit(app); }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(app.id); }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <h3 className="font-semibold leading-tight truncate">{app.title}</h3>
      {app.country && (
        <p className="mt-0.5 text-xs text-muted-foreground">{COUNTRY_FLAG[app.country]} {app.country}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
          {STAGE_LABEL[app.stage]}
        </span>
        <span className="text-xs text-muted-foreground">{daysAgo(app.appliedAt)}</span>
      </div>
      {quickActions.length > 0 && (
        <div className="mt-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100" onClick={e => e.stopPropagation()}>
          {quickActions.map(target => {
            const tc = STAGE_COLORS[target];
            return (
              <button
                key={target}
                type="button"
                onClick={e => { e.stopPropagation(); onStageChange(app, target); }}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity ${tc.bg} ${tc.text}`}
                title={`Move to ${STAGE_LABEL[target]}`}
              >
                → {STAGE_LABEL[target]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ApplicationForm (shared by Add + Edit) ────────────────────────────────────

interface AppFormState {
  title: string;
  stage: ApplicationStage;
  appliedAt: string; // date input value YYYY-MM-DD
  link: string;
  resumeId: string;
  coverLetterId: string;
  description: string;
  salary: string;
  country: ApplicationCountry | '';
}

function toDateInput(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function fromDateInput(val: string): number {
  const d = new Date(val);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

function ApplicationForm({
  state,
  onChange,
  resumes,
}: {
  state: AppFormState;
  onChange: (patch: Partial<AppFormState>) => void;
  resumes: ResumeData[];
}) {
  const resumeList = resumes.filter(r => !r.type || r.type === 'resume');
  const coverList = resumes.filter(r => r.type === 'coverletter');

  const inputCls = 'flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring';
  const labelCls = 'mb-1 block text-sm font-medium';

  return (
    <div className="grid gap-3">
      <div>
        <label className={labelCls}>Title <span className="text-destructive">*</span></label>
        <input className={inputCls} value={state.title} onChange={e => onChange({ title: e.target.value })} placeholder="e.g. Software Engineer at Acme" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Stage</label>
          <select className={inputCls} value={state.stage} onChange={e => onChange({ stage: e.target.value as ApplicationStage })}>
            {STAGE_ORDER.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Applied date</label>
          <input type="date" className={inputCls} value={state.appliedAt} onChange={e => onChange({ appliedAt: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Country</label>
        <select className={inputCls} value={state.country} onChange={e => onChange({ country: e.target.value as ApplicationCountry | '' })}>
          <option value="">None</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{COUNTRY_FLAG[c]} {c}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Link</label>
        <input className={inputCls} value={state.link} onChange={e => onChange({ link: e.target.value })} placeholder="https://..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Resume</label>
          <select className={inputCls} value={state.resumeId} onChange={e => onChange({ resumeId: e.target.value })}>
            <option value="">None</option>
            {resumeList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Cover letter</label>
          <select className={inputCls} value={state.coverLetterId} onChange={e => onChange({ coverLetterId: e.target.value })}>
            <option value="">None</option>
            {coverList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Salary</label>
        <input type="number" className={inputCls} value={state.salary} onChange={e => onChange({ salary: e.target.value })} placeholder="e.g. 120000" />
      </div>
      <div>
        <label className={labelCls}>Description / notes</label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          value={state.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="Job description, notes, contacts…"
        />
      </div>
    </div>
  );
}

// ── AddDialog ─────────────────────────────────────────────────────────────────

function AddDialog({
  open,
  onClose,
  onSave,
  resumes,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (app: ApplicationData) => void;
  resumes: ResumeData[];
}) {
  const blank = (): AppFormState => ({
    title: '', stage: 'applied', appliedAt: toDateInput(Date.now()),
    link: '', resumeId: '', coverLetterId: '', description: '', salary: '', country: '',
  });
  const [form, setForm] = React.useState<AppFormState>(blank);

  React.useEffect(() => { if (open) setForm(blank()); }, [open]);

  function handleSave() {
    if (!form.title.trim()) return;
    const now = Date.now();
    const appliedAt = fromDateInput(form.appliedAt);
    const app = createApplication(form.title.trim(), form.stage);
    const saved: ApplicationData = {
      ...app,
      appliedAt,
      lastModified: now,
      timeline: [{ stage: form.stage, at: appliedAt }],
      link: form.link || undefined,
      resumeId: form.resumeId || undefined,
      coverLetterId: form.coverLetterId || undefined,
      description: form.description || undefined,
      salary: form.salary ? Number(form.salary) : undefined,
      country: form.country || undefined,
    };
    onSave(saved);
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New application</DialogTitle>
          <DialogDescription>Track a job you applied to.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <ApplicationForm state={form} onChange={p => setForm(f => ({ ...f, ...p }))} resumes={resumes} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── EditDialog ────────────────────────────────────────────────────────────────

function EditDialog({
  app,
  onClose,
  onSave,
  resumes,
}: {
  app: ApplicationData | null;
  onClose: () => void;
  onSave: (app: ApplicationData) => void;
  resumes: ResumeData[];
}) {
  const [form, setForm] = React.useState<AppFormState>(() => ({
    title: '', stage: 'applied', appliedAt: toDateInput(Date.now()),
    link: '', resumeId: '', coverLetterId: '', description: '', salary: '', country: '',
  }));

  React.useEffect(() => {
    if (!app) return;
    setForm({
      title: app.title,
      stage: app.stage,
      appliedAt: toDateInput(app.appliedAt),
      link: app.link ?? '',
      resumeId: app.resumeId ?? '',
      coverLetterId: app.coverLetterId ?? '',
      description: app.description ?? '',
      salary: app.salary != null ? String(app.salary) : '',
      country: app.country ?? '',
    });
  }, [app]);

  if (!app) return null;

  function handleSave() {
    if (!form.title.trim() || !app) return;
    const now = Date.now();
    const stageChanged = form.stage !== app.stage;
    const newTimeline = stageChanged
      ? [...app.timeline, { stage: form.stage, at: now }]
      : app.timeline;
    const saved: ApplicationData = {
      ...app,
      title: form.title.trim(),
      stage: form.stage,
      appliedAt: fromDateInput(form.appliedAt),
      lastModified: now,
      timeline: newTimeline,
      link: form.link || undefined,
      resumeId: form.resumeId || undefined,
      coverLetterId: form.coverLetterId || undefined,
      description: form.description || undefined,
      salary: form.salary ? Number(form.salary) : undefined,
      country: form.country || undefined,
    };
    onSave(saved);
  }

  return (
    <Dialog open={!!app} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit application</DialogTitle>
        </DialogHeader>
        <div className="py-2 grid gap-4">
          <ApplicationForm state={form} onChange={p => setForm(f => ({ ...f, ...p }))} resumes={resumes} />
          {app.timeline.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Timeline</p>
              <div className="space-y-1">
                {[...app.timeline].reverse().map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${STAGE_COLORS[t.stage].bg} ${STAGE_COLORS[t.stage].text}`}>
                      {STAGE_LABEL[t.stage]}
                    </span>
                    <span>{new Date(t.at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>Save</Button>
        </DialogFooter>
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
  onImport: (apps: ApplicationData[]) => void;
}) {
  const [raw, setRaw] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => { if (open) { setRaw(''); setError(''); } }, [open]);

  function handleImport() {
    try {
      const parsed = JSON.parse(raw) as (ApplicationImport & Partial<ApplicationData>)[];
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
      const VALID_STAGES = new Set<string>(['applied', 'in_progress', 'offer', 'rejected']);
      const apps: ApplicationData[] = parsed.map(item => {
        if (!item.title) throw new Error('Each item must have a "title" field');
        const stage: ApplicationStage = VALID_STAGES.has(item.status ?? item.stage ?? '')
          ? (item.status ?? item.stage) as ApplicationStage
          : 'applied';
        const rawDate = item.date ?? (item.appliedAt ? new Date(item.appliedAt).toISOString() : undefined);
        const appliedAt = rawDate ? new Date(rawDate).getTime() : Date.now();
        const resolvedAt = isNaN(appliedAt) ? Date.now() : appliedAt;
        const base = createApplication(item.title, stage);
        return {
          ...base,
          id: item.id ?? base.id,
          appliedAt: resolvedAt,
          lastModified: item.lastModified ?? resolvedAt,
          timeline: Array.isArray(item.timeline) && item.timeline.length > 0
            ? item.timeline
            : [{ stage, at: resolvedAt }],
          link: item.link || undefined,
          description: item.description || undefined,
          salary: item.salary ? Number(item.salary) : undefined,
          resumeId: item.resumeId || undefined,
          coverLetterId: item.coverLetterId || undefined,
          country: (item.country === 'Netherlands' || item.country === 'Germany') ? item.country : undefined,
        };
      });
      onImport(apps);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import applications</DialogTitle>
          <DialogDescription>
            Paste a JSON array. Each item: <code className="text-xs bg-muted px-1 rounded">{'{ title, date?, link?, status? }'}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <textarea
            className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring resize-none"
            value={raw}
            onChange={e => { setRaw(e.target.value); setError(''); }}
            placeholder={'[\n  { "title": "Google SWE", "date": "2026-06-01", "status": "applied", "link": "https://..." }\n]'}
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

// ── StageGroup ────────────────────────────────────────────────────────────────

function StageGroup({
  stage,
  apps,
  onEdit,
  onDelete,
  onStageChange,
}: {
  stage: ApplicationStage;
  apps: ApplicationData[];
  onEdit: (app: ApplicationData) => void;
  onDelete: (id: string) => void;
  onStageChange: (app: ApplicationData, stage: ApplicationStage) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  if (apps.length === 0) return null;
  const colors = STAGE_COLORS[stage];
  const collapsed = stage === 'rejected' && !expanded;
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}>
          {STAGE_LABEL[stage]}
        </span>
        <span className="text-xs text-muted-foreground">{apps.length}</span>
        {stage === 'rejected' && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? 'Hide' : 'Show all'}
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...apps].sort((a, b) => b.appliedAt - a.appliedAt).map(app => (
            <ApplicationCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} onStageChange={onStageChange} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ApplicationsSection (main export) ─────────────────────────────────────────

export function ApplicationsSection({ resumes }: { resumes: ResumeData[] }) {
  const [apps, setApps] = React.useState<ApplicationData[]>([]);
  const [search, setSearch] = React.useState('');
  const [addOpen, setAddOpen] = React.useState(false);
  const [editApp, setEditApp] = React.useState<ApplicationData | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setApps(getApplications());
  }, []);

  function refresh() { setApps(getApplications()); }

  function handleSaveNew(app: ApplicationData) {
    saveApplication(app);
    refresh();
    setAddOpen(false);
  }

  function handleSaveEdit(app: ApplicationData) {
    saveApplication(app);
    refresh();
    setEditApp(null);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this application?')) return;
    deleteApplication(id);
    refresh();
  }

  function handleImport(imported: ApplicationData[]) {
    imported.forEach(a => saveApplication(a));
    refresh();
    setImportOpen(false);
  }

  function handleStageChange(app: ApplicationData, stage: ApplicationStage) {
    const now = Date.now();
    const updated: ApplicationData = {
      ...app,
      stage,
      lastModified: now,
      timeline: [...app.timeline, { stage, at: now }],
    };
    saveApplication(updated);
    refresh();
  }

  function handleCopy() {
    const text = buildAsciiChart(apps);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleExport() {
    const json = JSON.stringify(apps, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = search.trim()
    ? apps.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : apps;

  const hasAny = apps.length > 0;

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Applications</h2>
        <div className="flex items-center gap-2">
          {hasAny && (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy} title="Copy ASCII summary">
                <ClipboardCopy className="mr-1.5 h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} title="Export as JSON">
                <Download className="mr-1.5 h-4 w-4" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="mr-1.5 h-4 w-4" /> Import
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New Application
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!hasAny ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No applications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Track jobs you've applied to.</p>
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
          {/* Mini chart */}
          <div className="mb-4">
            <MiniChart apps={apps} />
            <div className="mt-2 flex flex-wrap gap-3">
              {STAGE_ORDER.map(stage => {
                const count = apps.filter(a => a.stage === stage).length;
                if (count === 0) return null;
                const colors = STAGE_COLORS[stage];
                return (
                  <span key={stage} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colors.bar }} />
                    {STAGE_LABEL[stage]} ({count})
                  </span>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or description…"
              className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Grouped cards */}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications match your search.</p>
          ) : (
            STAGE_ORDER.map(stage => (
              <StageGroup
                key={stage}
                stage={stage}
                apps={filtered.filter(a => a.stage === stage)}
                onStageChange={handleStageChange}
                onEdit={setEditApp}
                onDelete={handleDelete}
              />
            ))
          )}
        </>
      )}

      <AddDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={handleSaveNew} resumes={resumes} />
      <EditDialog app={editApp} onClose={() => setEditApp(null)} onSave={handleSaveEdit} resumes={resumes} />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
    </div>
  );
}

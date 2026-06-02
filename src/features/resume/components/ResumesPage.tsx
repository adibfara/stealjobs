import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, FileText, Download, Upload, Trash2, Clock, ChevronRight, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  getResumes,
  createResume,
  saveResume,
  deleteResume,
  exportResumeAsJson,
  importResumeFromFile,
  genId,
} from '@/lib/resumeStorage';
import type { ResumeData } from '@/types/resume';

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ResumesPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = React.useState<ResumeData[]>([]);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const importRef = React.useRef<HTMLInputElement>(null);
  const [conflictResume, setConflictResume] = React.useState<ResumeData | null>(null);
  const [conflictNewName, setConflictNewName] = React.useState('');
  const [duplicateSource, setDuplicateSource] = React.useState<ResumeData | null>(null);
  const [duplicateName, setDuplicateName] = React.useState('');

  React.useEffect(() => {
    setResumes(getResumes().sort((a, b) => b.lastModified - a.lastModified));
  }, []);

  function refresh() {
    setResumes(getResumes().sort((a, b) => b.lastModified - a.lastModified));
  }

  function handleCreate() {
    const name = newName.trim() || 'Untitled Resume';
    const r = createResume(name);
    saveResume(r);
    navigate({ to: '/resume/$resumeId', params: { resumeId: r.id } });
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this resume?')) return;
    deleteResume(id);
    refresh();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const r = await importResumeFromFile(file);
      const exists = getResumes().some(existing => existing.id === r.id);
      if (exists) {
        setConflictResume(r);
        setConflictNewName(r.name);
      } else {
        r.lastModified = Date.now();
        saveResume(r);
        refresh();
      }
    } catch {
      alert('Failed to import resume. Make sure it is a valid .resume.json file.');
    }
    e.target.value = '';
  }

  function handleConflictOverwrite() {
    if (!conflictResume) return;
    saveResume({ ...conflictResume, lastModified: Date.now() });
    setConflictResume(null);
    refresh();
  }

  function handleDuplicate(r: ResumeData, e: React.MouseEvent) {
    e.stopPropagation();
    setDuplicateSource(r);
    setDuplicateName(`${r.name} (copy)`);
  }

  function handleDuplicateConfirm() {
    if (!duplicateSource) return;
    const now = Date.now();
    saveResume({ ...duplicateSource, id: genId(), name: duplicateName.trim() || `${duplicateSource.name} (copy)`, lastModified: now, createdAt: now });
    setDuplicateSource(null);
    refresh();
  }

  function handleConflictCreateNew() {
    if (!conflictResume) return;
    const now = Date.now();
    saveResume({ ...conflictResume, id: genId(), name: conflictNewName.trim() || conflictResume.name, lastModified: now, createdAt: now });
    setConflictResume(null);
    refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Resume Builder</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} saved locally
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
              <Upload className="mr-1.5 h-4 w-4" /> Import
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New Resume
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* New resume form */}
        {creating && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium">Name your resume</p>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                }}
                placeholder="e.g. Software Engineer 2025"
                className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="ghost" onClick={() => { setCreating(false); setNewName(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {resumes.length === 0 && !creating && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">No resumes yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create your first resume or import an existing one.</p>
            <Button className="mt-6" onClick={() => setCreating(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Create Resume
            </Button>
          </div>
        )}

        {/* Resume grid */}
        {resumes.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map(r => (
              <div
                key={r.id}
                onClick={() => navigate({ to: '/resume/$resumeId', params: { resumeId: r.id } })}
                className="group relative cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); exportResumeAsJson(r); }}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Export as JSON"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={e => handleDuplicate(r, e)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Duplicate resume"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={e => handleDelete(r.id, e)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete resume"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold leading-tight truncate">{r.name}</h3>
                {r.title && (
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">{r.title}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(r.lastModified)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!duplicateSource} onOpenChange={open => { if (!open) setDuplicateSource(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate resume</DialogTitle>
            <DialogDescription>
              Choose a name for the duplicate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              autoFocus
              type="text"
              value={duplicateName}
              onChange={e => setDuplicateName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleDuplicateConfirm(); if (e.key === 'Escape') setDuplicateSource(null); }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDuplicateSource(null)}>Cancel</Button>
            <Button onClick={handleDuplicateConfirm}>Duplicate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!conflictResume} onOpenChange={open => { if (!open) setConflictResume(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume already exists</DialogTitle>
            <DialogDescription>
              A resume with this ID is already saved. Overwrite it or save as a new copy.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-1.5 text-sm font-medium">Name for new copy</p>
            <input
              type="text"
              value={conflictNewName}
              onChange={e => setConflictNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleConflictCreateNew(); }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleConflictOverwrite}>
              Overwrite existing
            </Button>
            <Button onClick={handleConflictCreateNew}>
              Save as new copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

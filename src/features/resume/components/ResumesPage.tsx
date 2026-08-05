import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, FileText, Download, Upload, Trash2, Clock, ChevronRight, Copy, Mail, DatabaseBackup, HardDriveDownload, Sparkles, Check } from 'lucide-react';
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
  createCoverLetter,
  saveResume,
  deleteResume,
  exportResumeAsJson,
  importResumeFromFile,
  genId,
} from '@/lib/resumeStorage';
import type { ResumeData } from '@/types/resume';
import { downloadAppBackup, copyAppBackupToClipboard, restoreAppBackup } from '@/lib/appBackup';
import { ThemeToggle } from '@/shared/theme/ThemeToggle';
import { ApplicationsSection } from './ApplicationsSection';
import { ExperiencesSection } from './ExperiencesSection';
import { ThemesPage } from '@/features/theme/ThemesPage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const AI_IMPORT_DOC = `# Full Data Import Format (adib-resume-builder)

"Import all data" restores a complete backup: every resume, cover letter,
experience, application, favorite tag, and the theme. Restoring REPLACES all
current data. Save the JSON as a .json file (or paste it) in the Import all data
dialog.

## Top-level envelope (AppBackup)
- app         string   — must be exactly "adib-resume-builder".
- version     number   — must be 1.
- exportedAt  number   — epoch ms (informational; use current time).
- data        object   — map of storage-key -> STRINGIFIED JSON value.

IMPORTANT: every VALUE inside "data" is a JSON string, not a nested object.
i.e. the arrays below are JSON.stringify'd before being placed in "data".

## data keys
- "resume-builder-resumes"        string — JSON.stringify of ResumeData[] (resumes + cover letters).
- "resume-builder-experiences"    string — JSON.stringify of ExperienceData[].
- "resume-builder-applications"   string — JSON.stringify of ApplicationData[].
- "resume-builder-favorite-tags"  string — JSON.stringify of string[] (favorited tag names).
- "project-ui-theme"              string — "light" | "dark" | "system". Optional.

All data keys are optional; include only what you want to restore.

## ResumeData (one resume or cover letter)
- id, name        string   — id is any unique slug; name shows in the dashboard.
- type            string   — "resume" | "coverletter". Optional, defaults to resume.
- title, subtitle string   — headline / secondary line. Optional.
- (each of title/subtitle may have a matching titleLink/subtitleLink string.)
- photo           string   — optional image URL.
- contacts        Contact[]  — { id, icon, text, link? }. icon is one of:
                  Mail, Phone, Globe, Linkedin, Github, MapPin, Twitter, Link,
                  Youtube, Instagram, Facebook, Briefcase, Calendar, ExternalLink,
                  User, Building2, Rss, Award, Laptop, BookOpen, FileText, AtSign.
- sections        Section[]  — { id, title?, titleLink?, subsections: SubSection[] }.
- selectedTemplate string — "classic" | "modern" | "modernrow" | "professional".
- lastModified, createdAt number — epoch ms.

SubSection: { id, title?, subtitle?, date? (+ *Link variants), text?,
  bullets: Bullet[], tags: Tag[], type: 1|2|3, tagsPosition?, tagsHidden? }
  type: 1 = title + subtitle + date row, 2 = no subtitle, 3 = template variation.
Bullet: { id, text, link? }.   Tag: { id, text }.

## ExperienceData (reusable experience bank)
- id, title, company   string
- tags                 string[]
- context, goal, action, result, learning  string[] (STAR-style bullet lists)
- description          string
- order                number  — sort order
- createdAt, lastModified number — epoch ms

## ApplicationData (job application tracker)
- id, title            string
- stage                "applied" | "in_progress" | "offer" | "rejected"
- appliedAt, lastModified number — epoch ms
- link, description     string   — optional
- resumeId, coverLetterId string — optional; reference a ResumeData.id
- salary               number    — optional
- country              "Netherlands" | "Germany" | "UAE" — optional
- timeline             { stage, at }[]  — stage change history (at = epoch ms)

## Notes
- Every entity needs a unique "id" string. Random short strings are fine.
- Remember to JSON.stringify each value under "data" — the values are strings.

## Minimal example
{
  "app": "adib-resume-builder",
  "version": 1,
  "exportedAt": 0,
  "data": {
    "resume-builder-resumes": "[{\\"id\\":\\"r1\\",\\"name\\":\\"Jane Doe\\",\\"type\\":\\"resume\\",\\"title\\":\\"Senior Frontend Engineer\\",\\"contacts\\":[{\\"id\\":\\"c1\\",\\"icon\\":\\"Mail\\",\\"text\\":\\"jane@example.com\\",\\"link\\":\\"mailto:jane@example.com\\"}],\\"sections\\":[{\\"id\\":\\"s1\\",\\"title\\":\\"Experience\\",\\"subsections\\":[{\\"id\\":\\"ss1\\",\\"title\\":\\"Senior Frontend Engineer\\",\\"subtitle\\":\\"Acme Corp\\",\\"date\\":\\"2021 – Present\\",\\"type\\":1,\\"bullets\\":[{\\"id\\":\\"b1\\",\\"text\\":\\"Led migration to React 19.\\"}],\\"tags\\":[{\\"id\\":\\"t1\\",\\"text\\":\\"React\\"}]}]}],\\"selectedTemplate\\":\\"classic\\",\\"lastModified\\":0,\\"createdAt\\":0}]",
    "resume-builder-applications": "[{\\"id\\":\\"a1\\",\\"title\\":\\"Frontend @ Acme\\",\\"stage\\":\\"applied\\",\\"appliedAt\\":0,\\"lastModified\\":0,\\"resumeId\\":\\"r1\\",\\"timeline\\":[{\\"stage\\":\\"applied\\",\\"at\\":0}]}]",
    "resume-builder-favorite-tags": "[\\"React\\",\\"TypeScript\\"]"
  }
}`;

const AI_RESUME_IMPORT_DOC = `# Resume Import Format (adib-resume-builder)

"Import" expects a single JSON object describing ONE document (a resume or cover
letter). Save it as a .json file and use the Import action to load it. The root
IS the ResumeData object — do NOT wrap it in an array or envelope.

## Top-level object (ResumeData)
- id            string   — unique id. Any non-empty string; use a random slug.
- name          string   — internal document name shown in the dashboard.
- type          string   — "resume" or "coverletter". Optional, defaults to resume.
- title         string   — headline under the name (e.g. "Senior Frontend Engineer"). Optional.
- titleLink     string   — optional hyperlink for the title.
- subtitle      string   — secondary line (e.g. location / tagline). Optional.
- subtitleLink  string   — optional hyperlink for the subtitle.
- photo         string   — optional image URL.
- contacts      Contact[] — contact rows (email, phone, links).
- sections      Section[] — the body of the document.
- selectedTemplate string — one of: "classic", "modern", "modernrow", "professional". Default "classic".
- lastModified  number   — epoch ms. Use current time.
- createdAt     number   — epoch ms. Use current time.

## Contact
- id    string
- icon  string  — one of: Mail, Phone, Globe, Linkedin, Github, MapPin, Twitter,
                  Link, Youtube, Instagram, Facebook, Briefcase, Calendar,
                  ExternalLink, User, Building2, Rss, Award, Laptop, BookOpen,
                  FileText, AtSign.
- text  string  — displayed text (e.g. "you@email.com").
- link  string  — optional hyperlink (e.g. "mailto:you@email.com").

## Section
- id          string
- title       string     — section heading (e.g. "Experience", "Education"). Optional.
- titleLink   string     — optional hyperlink for the heading.
- subsections SubSection[] — entries inside the section.

## SubSection (one entry, e.g. one job or one degree)
- id           string
- title        string    — main line (e.g. job title or school). Optional.
- titleLink    string    — optional hyperlink.
- subtitle     string    — company / secondary line. Optional.
- subtitleLink string    — optional hyperlink.
- date         string    — free-text date range (e.g. "2021 – Present"). Optional.
- dateLink     string    — optional hyperlink.
- text         string    — paragraph body (used for cover letters / summaries). Optional.
- bullets      Bullet[]  — bullet points.
- tags         Tag[]     — short chips (e.g. skills used).
- type         number    — layout: 1 = title + subtitle + date row,
                           2 = no subtitle, 3 = template-specific variation.
- tagsPosition string    — "top" or "bottom". Optional.
- tagsHidden   boolean   — hide tags for this entry. Optional.

## Bullet
- id    string
- text  string  — the bullet content.
- link  string  — optional hyperlink.

## Tag
- id    string
- text  string  — the chip label.

## Notes
- Every entity needs a unique "id" string. Random short strings are fine.
- Only "id" fields and the arrays (contacts, sections, subsections, bullets,
  tags) are structurally required; all other fields are optional.

## Minimal example
{
  "id": "abc123",
  "name": "Jane Doe — Frontend",
  "type": "resume",
  "title": "Senior Frontend Engineer",
  "subtitle": "Berlin, Germany",
  "contacts": [
    { "id": "c1", "icon": "Mail", "text": "jane@example.com", "link": "mailto:jane@example.com" },
    { "id": "c2", "icon": "Github", "text": "github.com/jane", "link": "https://github.com/jane" }
  ],
  "sections": [
    {
      "id": "s1",
      "title": "Experience",
      "subsections": [
        {
          "id": "ss1",
          "title": "Senior Frontend Engineer",
          "subtitle": "Acme Corp",
          "date": "2021 – Present",
          "type": 1,
          "bullets": [
            { "id": "b1", "text": "Led migration to React 19, cutting bundle size 30%." }
          ],
          "tags": [
            { "id": "t1", "text": "React" },
            { "id": "t2", "text": "TypeScript" }
          ]
        }
      ]
    }
  ],
  "selectedTemplate": "classic",
  "lastModified": 0,
  "createdAt": 0
}`;

interface DocCardProps {
  r: ResumeData;
  onNavigate: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (r: ResumeData, e: React.MouseEvent) => void;
  onExport: (r: ResumeData) => void;
  icon: 'resume' | 'coverletter';
}

function DocCard({ r, onNavigate, onDelete, onDuplicate, onExport, icon }: DocCardProps) {
  return (
    <div
      onClick={() => onNavigate(r.id)}
      className="group relative cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon === 'coverletter'
            ? <Mail className="h-5 w-5 text-muted-foreground" />
            : <FileText className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onExport(r); }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Export as JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={e => onDuplicate(r, e)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={e => onDelete(r.id, e)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <h3 className="font-semibold leading-tight truncate">{r.name}</h3>
      {r.title && <p className="mt-0.5 text-sm text-muted-foreground truncate">{r.title}</p>}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(r.lastModified)}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

interface ResumeSectionProps {
  items: ResumeData[];
  title: string;
  emptyLabel: string;
  emptyDesc: string;
  onCreateClick: () => void;
  onNavigate: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (r: ResumeData, e: React.MouseEvent) => void;
  onExport: (r: ResumeData) => void;
  icon: 'resume' | 'coverletter';
  creating: boolean;
}

function ResumeSection({ items, title, emptyLabel, emptyDesc, onCreateClick, onNavigate, onDelete, onDuplicate, onExport, icon, creating }: ResumeSectionProps) {
  if (items.length === 0 && creating) return null;
  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">{emptyLabel}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDesc}</p>
          <Button className="mt-5" size="sm" onClick={onCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" /> Create
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(r => (
            <DocCard key={r.id} r={r} onNavigate={onNavigate} onDelete={onDelete} onDuplicate={onDuplicate} onExport={onExport} icon={icon} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CoverLetterSectionProps {
  items: ResumeData[];
  onCreateClick: () => void;
  onNavigate: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDuplicate: (r: ResumeData, e: React.MouseEvent) => void;
  onExport: (r: ResumeData) => void;
  creating: boolean;
}

function CoverLetterSection({ items, onCreateClick, onNavigate, onDelete, onDuplicate, onExport, creating }: CoverLetterSectionProps) {
  if (items.length === 0 && creating) return null;
  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Cover Letters</h2>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={onCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" /> New
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Mail className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No cover letters yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create a cover letter to pair with your resume.</p>
          <Button className="mt-5" size="sm" onClick={onCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" /> Create
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(r => (
            <DocCard key={r.id} r={r} onNavigate={onNavigate} onDelete={onDelete} onDuplicate={onDuplicate} onExport={onExport} icon="coverletter" />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [creating, setCreating] = React.useState<'resume' | 'coverletter' | null>(null);
  const [newName, setNewName] = React.useState('');
  const importRef = React.useRef<HTMLInputElement>(null);
  const [conflictResume, setConflictResume] = React.useState<ResumeData | null>(null);
  const [conflictNewName, setConflictNewName] = React.useState('');
  const [duplicateSource, setDuplicateSource] = React.useState<ResumeData | null>(null);
  const [duplicateName, setDuplicateName] = React.useState('');
  const [backupImportOpen, setBackupImportOpen] = React.useState(false);
  const [backupRaw, setBackupRaw] = React.useState('');
  const [backupError, setBackupError] = React.useState('');
  const [exportedNote, setExportedNote] = React.useState('');
  const [aiImportOpen, setAiImportOpen] = React.useState(false);
  const [aiResumeImportOpen, setAiResumeImportOpen] = React.useState(false);
  const [docCopied, setDocCopied] = React.useState(false);
  const [resumeDocCopied, setResumeDocCopied] = React.useState(false);
  const backupFileRef = React.useRef<HTMLInputElement>(null);

  async function handleCopyDoc() {
    try {
      await navigator.clipboard.writeText(AI_IMPORT_DOC);
      setDocCopied(true);
      setTimeout(() => setDocCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function handleCopyResumeDoc() {
    try {
      await navigator.clipboard.writeText(AI_RESUME_IMPORT_DOC);
      setResumeDocCopied(true);
      setTimeout(() => setResumeDocCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function refresh() {
    const list = await getResumes();
    setResumes(list.sort((a, b) => b.lastModified - a.lastModified));
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function handleCreate() {
    if (!creating) return;
    const isCover = creating === 'coverletter';
    const name = newName.trim() || (isCover ? 'Untitled Cover Letter' : 'Untitled Resume');
    const r = isCover ? createCoverLetter(name) : createResume(name);
    await saveResume(r);
    navigate({ to: '/resume/$resumeId', params: { resumeId: r.id } });
  }

  async function handleDelete(id: string, e: React.MouseEvent, label = 'resume') {
    e.stopPropagation();
    if (!confirm(`Delete this ${label}?`)) return;
    await deleteResume(id);
    refresh();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const r = await importResumeFromFile(file);
      const exists = (await getResumes()).some(existing => existing.id === r.id);
      if (exists) {
        setConflictResume(r);
        setConflictNewName(r.name);
      } else {
        r.lastModified = Date.now();
        await saveResume(r);
        refresh();
      }
    } catch {
      alert('Failed to import resume. Make sure it is a valid .resume.json file.');
    }
    e.target.value = '';
  }

  async function handleConflictOverwrite() {
    if (!conflictResume) return;
    await saveResume({ ...conflictResume, lastModified: Date.now() });
    setConflictResume(null);
    refresh();
  }

  function handleDuplicate(r: ResumeData, e: React.MouseEvent) {
    e.stopPropagation();
    setDuplicateSource(r);
    setDuplicateName(`${r.name} (copy)`);
  }

  async function handleDuplicateConfirm() {
    if (!duplicateSource) return;
    const now = Date.now();
    await saveResume({ ...duplicateSource, id: genId(), name: duplicateName.trim() || `${duplicateSource.name} (copy)`, lastModified: now, createdAt: now });
    setDuplicateSource(null);
    refresh();
  }

  async function handleExportAll() {
    downloadAppBackup();
    const copied = await copyAppBackupToClipboard();
    setExportedNote(copied ? 'Backup downloaded and copied to clipboard.' : 'Backup downloaded (clipboard unavailable).');
    setTimeout(() => setExportedNote(''), 4000);
  }

  function applyBackupRestore(raw: string) {
    try {
      restoreAppBackup(raw);
      // Full-state change — reload so every section reflects the restored data.
      window.location.reload();
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Invalid backup file');
    }
  }

  async function handleBackupFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!confirm('Restoring will replace ALL current data (resumes, experiences, applications, tags, settings). Continue?')) return;
    applyBackupRestore(await file.text());
  }

  function handleBackupPaste() {
    if (!backupRaw.trim()) return;
    if (!confirm('Restoring will replace ALL current data (resumes, experiences, applications, tags, settings). Continue?')) return;
    applyBackupRestore(backupRaw);
  }

  async function handleConflictCreateNew() {
    if (!conflictResume) return;
    const now = Date.now();
    await saveResume({ ...conflictResume, id: genId(), name: conflictNewName.trim() || conflictResume.name, lastModified: now, createdAt: now });
    setConflictResume(null);
    refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="applications">
        {/* Top bar */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto grid max-w-5xl grid-cols-3 items-center px-6 py-4">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="experiences">Experiences</TabsTrigger>
                <TabsTrigger value="resumes">Resumes</TabsTrigger>
                <TabsTrigger value="themes">Themes</TabsTrigger>
              </TabsList>
            </div>
            <h1 className="text-center text-xl font-bold tracking-tight">Jobs</h1>
            <div className="flex items-center justify-end gap-2">
              <input
                ref={importRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
              {exportedNote && (
                <span className="text-xs text-muted-foreground">{exportedNote}</span>
              )}
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={() => importRef.current?.click()}>
                    <Upload className="mr-1.5 h-4 w-4" /> Import applications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setResumeDocCopied(false); setAiResumeImportOpen(true); }}>
                    <Sparkles className="mr-1.5 h-4 w-4" /> AI Resume Import
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setDocCopied(false); setAiImportOpen(true); }}>
                    <Sparkles className="mr-1.5 h-4 w-4" /> AI Import (all data)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setCreating('coverletter'); setNewName(''); }}>
                    <Plus className="mr-1.5 h-4 w-4" /> Cover Letter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setCreating('resume'); setNewName(''); }}>
                    <Plus className="mr-1.5 h-4 w-4" /> Resume
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportAll}>
                    <HardDriveDownload className="mr-1.5 h-4 w-4" /> Export all
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBackupRaw(''); setBackupError(''); setBackupImportOpen(true); }}>
                    <DatabaseBackup className="mr-1.5 h-4 w-4" /> Import all
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-6 pb-8 pt-3">
          <TabsContent value="applications">
            <ApplicationsSection resumes={resumes} />
          </TabsContent>

          <TabsContent value="experiences">
            <ExperiencesSection />
          </TabsContent>

          <TabsContent value="resumes">
            {/* New document form */}
            {creating && (
              <div className="mb-6 rounded-xl border border-primary/30 bg-card p-4 shadow-sm">
                <p className="mb-2 text-sm font-medium">
                  {creating === 'coverletter' ? 'Name your cover letter' : 'Name your resume'}
                </p>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreate();
                      if (e.key === 'Escape') { setCreating(null); setNewName(''); }
                    }}
                    placeholder={creating === 'coverletter' ? 'e.g. Google Cover Letter' : 'e.g. Software Engineer 2025'}
                    className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={handleCreate}>Create</Button>
                  <Button variant="ghost" onClick={() => { setCreating(null); setNewName(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <ResumeSection
              items={resumes.filter(r => !r.type || r.type === 'resume')}
              title="Resumes"
              emptyLabel="No resumes yet"
              emptyDesc="Create your first resume or import an existing one."
              onCreateClick={() => { setCreating('resume'); setNewName(''); }}
              onNavigate={id => navigate({ to: '/resume/$resumeId', params: { resumeId: id } })}
              onDelete={(id, e) => handleDelete(id, e, 'resume')}
              onDuplicate={handleDuplicate}
              onExport={r => exportResumeAsJson(r)}
              icon="resume"
              creating={!!creating}
            />

            <CoverLetterSection
              items={resumes.filter(r => r.type === 'coverletter')}
              onCreateClick={() => { setCreating('coverletter'); setNewName(''); }}
              onNavigate={id => navigate({ to: '/resume/$resumeId', params: { resumeId: id } })}
              onDelete={(id, e) => handleDelete(id, e, 'cover letter')}
              onDuplicate={handleDuplicate}
              onExport={r => exportResumeAsJson(r)}
              creating={!!creating}
            />
          </TabsContent>

          <TabsContent value="themes">
            <ThemesPage />
          </TabsContent>
        </main>
      </Tabs>

      <input
        ref={backupFileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleBackupFile}
      />

      <Dialog open={aiResumeImportOpen} onOpenChange={setAiResumeImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI Resume Import
            </DialogTitle>
            <DialogDescription>
              Hand this spec to any AI (ChatGPT, Claude, …) and ask it to produce a
              single resume JSON. Save the result as a <code>.json</code> file, then use
              <strong> Import</strong> to load it. Copy the document below to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-2 z-10"
              onClick={handleCopyResumeDoc}
            >
              {resumeDocCopied
                ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Copied</>
                : <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</>}
            </Button>
            <pre className="max-h-[55vh] overflow-auto rounded-md border border-input bg-muted/50 p-4 pt-12 font-mono text-xs whitespace-pre-wrap">
              {AI_RESUME_IMPORT_DOC}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiResumeImportOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={aiImportOpen} onOpenChange={setAiImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI Import
            </DialogTitle>
            <DialogDescription>
              Hand this spec to any AI (ChatGPT, Claude, …) and ask it to produce a
              full-backup JSON. Save the result as a <code>.json</code> file (or paste it),
              then use <strong>Import all data</strong> to load it. Copy the document below to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-2 z-10"
              onClick={handleCopyDoc}
            >
              {docCopied
                ? <><Check className="mr-1.5 h-3.5 w-3.5" /> Copied</>
                : <><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy</>}
            </Button>
            <pre className="max-h-[55vh] overflow-auto rounded-md border border-input bg-muted/50 p-4 pt-12 font-mono text-xs whitespace-pre-wrap">
              {AI_IMPORT_DOC}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAiImportOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={backupImportOpen} onOpenChange={open => { if (!open) setBackupImportOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import all data</DialogTitle>
            <DialogDescription>
              Restore a full backup (resumes, experiences, applications, tags, settings). This replaces all current data. Upload a file or paste the backup JSON.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Button variant="outline" size="sm" className="mb-3" onClick={() => backupFileRef.current?.click()}>
              <Upload className="mr-1.5 h-4 w-4" /> Choose backup file…
            </Button>
            <textarea
              className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-ring resize-none"
              value={backupRaw}
              onChange={e => { setBackupRaw(e.target.value); setBackupError(''); }}
              placeholder='{ "app": "adib-resume-builder", "version": 1, "data": { ... } }'
            />
            {backupError && <p className="mt-1.5 text-xs text-destructive">{backupError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBackupImportOpen(false)}>Cancel</Button>
            <Button onClick={handleBackupPaste} disabled={!backupRaw.trim()}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

import * as React from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkedInput } from './LinkedInput';
import { genId } from '@/lib/resumeStorage';
import type { SubSection, Bullet, SubSectionType } from '@/types/resume';
import { cn } from '@/lib/utils';

interface SubSectionEditorProps {
  subsection: SubSection;
  onChange: (s: SubSection) => void;
  onDelete: () => void;
}

export function SubSectionEditor({ subsection, onChange, onDelete }: SubSectionEditorProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  function update(patch: Partial<SubSection>) {
    onChange({ ...subsection, ...patch });
  }

  function addBullet() {
    update({ bullets: [...subsection.bullets, { id: genId(), text: '' }] });
  }

  function updateBullet(id: string, patch: Partial<Bullet>) {
    update({ bullets: subsection.bullets.map(b => b.id === id ? { ...b, ...patch } : b) });
  }

  function removeBullet(id: string) {
    update({ bullets: subsection.bullets.filter(b => b.id !== id) });
  }

  function addTag() {
    update({ tags: [...subsection.tags, { id: genId(), text: '' }] });
  }

  function updateTagText(id: string, text: string) {
    update({ tags: subsection.tags.map(t => t.id === id ? { ...t, text } : t) });
  }

  function removeTag(id: string) {
    update({ tags: subsection.tags.filter(t => t.id !== id) });
  }

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Bullets</label>
              <button
                type="button"
                onClick={addBullet}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {subsection.bullets.map(bullet => (
                <div key={bullet.id} className="flex items-start gap-1.5">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  <LinkedInput
                    value={bullet.text}
                    onChange={v => updateBullet(bullet.id, { text: v })}
                    link={bullet.link}
                    onLinkChange={v => updateBullet(bullet.id, { link: v })}
                    placeholder="Bullet point..."
                    multiline
                    rows={2}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeBullet(bullet.id)}
                    className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Tags</label>
              <button
                type="button"
                onClick={addTag}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {subsection.tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center gap-0.5 rounded-full border border-border bg-muted px-2.5 py-1"
                >
                  <input
                    type="text"
                    value={tag.text}
                    onChange={e => updateTagText(tag.id, e.target.value)}
                    placeholder="Tag..."
                    className="bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
                    style={{ width: `${Math.max(3, tag.text.length + 1)}ch` }}
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="ml-0.5 text-xs text-muted-foreground/50 transition-colors hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

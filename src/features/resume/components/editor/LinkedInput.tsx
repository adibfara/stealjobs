import * as React from 'react';
import { Link2, Link2Off, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LinkedInputProps {
  value: string;
  onChange: (value: string) => void;
  link?: string;
  onLinkChange: (link: string | undefined) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  rows?: number;
  autoFocus?: boolean;
}

export function LinkedInput({
  value,
  onChange,
  link,
  onLinkChange,
  placeholder,
  multiline = false,
  className,
  rows = 3,
  autoFocus = false,
}: LinkedInputProps) {
  const [linkDraft, setLinkDraft] = React.useState(link ?? '');
  const [open, setOpen] = React.useState(false);
  const hasLink = !!link;

  React.useEffect(() => {
    if (open) setLinkDraft(link ?? '');
  }, [open, link]);

  function handleSave() {
    onLinkChange(linkDraft.trim() || undefined);
    setOpen(false);
  }

  function handleClear() {
    setLinkDraft('');
    onLinkChange(undefined);
    setOpen(false);
  }

  const linkBtn = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded transition-all',
            hasLink
              ? 'text-amber-500 opacity-100'
              : 'text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
          )}
          title={hasLink ? 'Edit link' : 'Add link'}
        >
          <Link2 className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Link URL</p>
          <Input
            value={linkDraft}
            onChange={e => setLinkDraft(e.target.value)}
            placeholder="https://..."
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleSave}>
              <Check className="mr-1 h-3.5 w-3.5" /> Save
            </Button>
            {hasLink && (
              <Button size="sm" variant="outline" onClick={handleClear} title="Remove link">
                <Link2Off className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (multiline) {
    return (
      <div className={cn('group relative', className)}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          autoFocus={autoFocus}
          className="flex w-full resize-y rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {linkBtn}
      </div>
    );
  }

  return (
    <div className={cn('group relative', className)}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      {linkBtn}
    </div>
  );
}

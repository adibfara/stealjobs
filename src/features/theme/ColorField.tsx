import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

export function ColorField({ value, onChange, label }: ColorFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value);

  React.useEffect(() => { setDraft(value); }, [value]);

  function commit(hex: string) {
    setDraft(hex);
    onChange(hex);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs hover:bg-accent"
          title={label ?? value}
        >
          <span
            className="h-4 w-4 shrink-0 rounded border border-border"
            style={{ background: value }}
          />
          {label && <span className="truncate">{label}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-f]{6}$/i.test(draft) ? draft : '#000000'}
            onChange={e => commit(e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded border border-input bg-background p-0"
          />
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={e => { if (e.key === 'Enter') commit(draft); }}
            className="h-9 font-mono text-xs"
            placeholder="#rrggbb"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

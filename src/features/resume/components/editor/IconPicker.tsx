import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ICON_NAMES, type IconName } from '@/types/resume';

type LucideIconComponent = React.ComponentType<{ className?: string; size?: number }>;

export function DynIcon({ name, className, size }: { name: string; className?: string; size?: number }) {
  const icons = LucideIcons as unknown as Record<string, LucideIconComponent>;
  const Icon = icons[name];
  if (!Icon) return <LucideIcons.Link className={className} size={size} />;
  return <Icon className={className} size={size} />;
}

interface IconPickerProps {
  value: IconName;
  onChange: (icon: IconName) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent"
          title="Change icon"
        >
          <DynIcon name={value} className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Select icon</p>
        <div className="grid grid-cols-6 gap-1">
          {ICON_NAMES.map(name => (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => { onChange(name as IconName); setOpen(false); }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-accent',
                value === name && 'bg-primary text-primary-foreground'
              )}
            >
              <DynIcon name={name} className="h-4 w-4" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

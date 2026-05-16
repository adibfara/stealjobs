import * as React from 'react';
import * as LucideIcons from 'lucide-react';
import type { ResumeData, SubSection } from '@/types/resume';

type LucideIconComponent = React.ComponentType<{ size?: number; strokeWidth?: number }>;

export function TemplateIcon({ name, size = 12, strokeWidth = 1.5 }: { name: string; size?: number; strokeWidth?: number }) {
  const icons = LucideIcons as unknown as Record<string, LucideIconComponent>;
  const Icon = icons[name] ?? icons['Link'];
  return <Icon size={size} strokeWidth={strokeWidth} />;
}

export function LinkedText({
  text,
  link,
  style,
  className,
}: {
  text?: string;
  link?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  if (!text) return null;
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" style={style} className={className}>
        {text}
      </a>
    );
  }
  return <span style={style} className={className}>{text}</span>;
}

export type { ResumeData, SubSection };

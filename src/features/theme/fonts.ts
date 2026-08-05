import type { FontRef } from '@/types/theme';

export const FONT_FAMILIES: Record<FontRef, string> = {
  'instrument-sans': "'Instrument Sans', 'Geist Variable', sans-serif",
  'dm-serif': "'DM Serif Display', Georgia, serif",
  'geist': "'Geist Variable', sans-serif",
  'crimson-pro': "'Crimson Pro', 'EB Garamond', Georgia, serif",
  'eb-garamond': "'EB Garamond', Georgia, serif",
  'lora': "'Lora', Georgia, serif",
  'ubuntu': "'Ubuntu', 'Helvetica Neue', Arial, sans-serif",
};

export const FONT_OPTIONS: { value: FontRef; label: string }[] = [
  { value: 'instrument-sans', label: 'Instrument Sans' },
  { value: 'geist', label: 'Geist' },
  { value: 'dm-serif', label: 'DM Serif Display' },
  { value: 'crimson-pro', label: 'Crimson Pro' },
  { value: 'eb-garamond', label: 'EB Garamond' },
  { value: 'lora', label: 'Lora' },
  { value: 'ubuntu', label: 'Ubuntu' },
];

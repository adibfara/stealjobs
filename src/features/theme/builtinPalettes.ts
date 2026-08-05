import type { NamedPalette } from '@/types/theme';
import { modernRowTheme, DEFAULT_PALETTE_ID } from './builtinThemes';

export const defaultPalette: NamedPalette = {
  id: DEFAULT_PALETTE_ID,
  name: 'Default',
  colors: modernRowTheme.palette,
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const slatePalette: NamedPalette = {
  id: 'builtin-slate',
  name: 'Slate',
  colors: {
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    muted: '#475569',
    faint: '#94a3b8',
    primary: '#334155',
    accent: '#0f766e',
    border: '#cbd5e1',
  },
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const navyPalette: NamedPalette = {
  id: 'builtin-navy',
  name: 'Navy',
  colors: {
    background: '#ffffff',
    surface: '#f1f5f9',
    text: '#0f172a',
    muted: '#475569',
    faint: '#94a3b8',
    primary: '#1e3a8a',
    accent: '#b45309',
    border: '#cbd5e1',
  },
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const charcoalPalette: NamedPalette = {
  id: 'builtin-charcoal',
  name: 'Charcoal',
  colors: {
    background: '#ffffff',
    surface: '#f5f5f4',
    text: '#1c1917',
    muted: '#57534e',
    faint: '#a8a29e',
    primary: '#292524',
    accent: '#9f1239',
    border: '#d6d3d1',
  },
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const forestPalette: NamedPalette = {
  id: 'builtin-forest',
  name: 'Forest',
  colors: {
    background: '#ffffff',
    surface: '#f6f7f4',
    text: '#1a2e1a',
    muted: '#4b5f4b',
    faint: '#8fa38f',
    primary: '#14532d',
    accent: '#92400e',
    border: '#d4dbd0',
  },
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const builtinPalettes: NamedPalette[] = [
  defaultPalette,
  slatePalette,
  navyPalette,
  charcoalPalette,
  forestPalette,
];

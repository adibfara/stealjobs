export interface Palette {
  background: string;
  surface: string;
  text: string;
  muted: string;
  faint: string;
  primary: string;
  accent: string;
  border: string;
}
export type ColorRole = keyof Palette;
export type ColorRef = ColorRole | { literal: string };

export interface NamedPalette {
  id: string;
  name: string;
  colors: Palette;
  builtin?: boolean;
  createdAt: number;
  lastModified: number;
}

export interface PageStyle {
  background: ColorRef;
  paddingV: number;
  paddingH: number;
}

export type ContainerKind = 'row' | 'column' | 'box';
export type ElementKind = 'text' | 'image' | 'bullets' | 'icon';
export type NodeKind = ContainerKind | ElementKind;

export type RepeatSource = 'contacts' | 'sections' | 'subsections' | 'bullets' | 'tags' | 'images';

export type Binding =
  | 'resume.title' | 'resume.subtitle' | 'resume.photo' | 'resume.name'
  | 'contact.icon' | 'contact.text'
  | 'section.title'
  | 'subsection.title' | 'subsection.subtitle' | 'subsection.date' | 'subsection.text'
  | 'bullet.text' | 'tag.text'
  | 'image.title' | 'image.subtitle' | 'image.imageLink'
  | { literal: string };

export type Condition =
  | { field: 'subsection.type'; equals: number }
  | { field: 'subsection.type'; notEquals: number }
  | { field: 'subsection.tagsPosition'; equals: 'top' | 'bottom' }
  | { field: 'subsection.tagsPosition'; notEquals: 'top' | 'bottom' }
  | { fieldPresent: Binding }
  | { any: Condition[] }
  | { all: Condition[] };

export type FontRef =
  | 'instrument-sans' | 'dm-serif' | 'geist' | 'crimson-pro' | 'eb-garamond' | 'lora' | 'ubuntu';

export interface NodeStyle {
  direction?: 'row' | 'column';
  wrap?: boolean;
  widthMode?: 'hug' | 'fill' | 'fixed';
  widthValue?: number;
  gap?: number;
  align?: 'start' | 'center' | 'end';
  verticalAlign?: 'start' | 'center' | 'end';
  padding?: [number, number, number, number];
  margin?: [number, number, number, number];
  fontFamily?: FontRef;
  fontSize?: number;
  fontWeight?: 400 | 600 | 700;
  italic?: boolean;
  color?: ColorRef;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase';
  background?: ColorRef;
  borderRadius?: number;
  border?: { width: number; color: ColorRef; style: 'solid' | 'dashed' | 'dotted' } | null;
  iconName?: string;
  iconSize?: number;
  bulletMarker?: 'dot' | 'none';
  imageWidth?: number;
  imageHeight?: number;
  imageRadius?: number;
  imageCircle?: boolean;
  opacity?: number;
}

export interface ThemeNode {
  id: string;
  kind: NodeKind;
  name?: string;
  repeat?: RepeatSource;
  binding?: Binding;
  visibleWhen?: Condition;
  style: NodeStyle;
  children?: ThemeNode[];
}

export interface ThemeData {
  id: string;
  name: string;
  builtin?: boolean;
  palette: Palette;
  paletteId?: string;
  page: PageStyle;
  root: ThemeNode;
  createdAt: number;
  lastModified: number;
}

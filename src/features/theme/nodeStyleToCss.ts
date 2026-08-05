import type * as React from 'react';
import type { ColorRef, NodeStyle, Palette } from '@/types/theme';
import { FONT_FAMILIES } from './fonts';

export function resolveColor(ref: ColorRef | undefined, palette: Palette): string | undefined {
  if (!ref) return undefined;
  if (typeof ref === 'string') return palette[ref];
  return ref.literal;
}

function pt(n: number | undefined): string | undefined {
  return n === undefined ? undefined : `${n}pt`;
}

export function imageDimensionStyle(style: NodeStyle): React.CSSProperties {
  return {
    width: pt(style.imageWidth ?? 60),
    height: pt(style.imageHeight ?? 60),
    objectFit: 'cover',
    borderRadius: style.imageCircle ? '50%' : (style.imageRadius !== undefined ? pt(style.imageRadius) : undefined),
  };
}

export function nodeStyleToCss(style: NodeStyle, palette: Palette, kind: string): React.CSSProperties {
  const css: React.CSSProperties = {};

  const isContainer = kind === 'row' || kind === 'column' || kind === 'box';
  if (isContainer) {
    css.display = 'flex';
    css.flexDirection = kind === 'row' ? 'row' : (style.direction ?? 'column');
    if (style.wrap) css.flexWrap = 'wrap';
    if (style.gap !== undefined) css.gap = pt(style.gap);
    css.alignItems = toFlexAlign(style.align);
    css.justifyContent = kind === 'row' ? toFlexAlign(style.verticalAlign) : undefined;
  }

  if (style.widthMode === 'fill') css.flex = '1 1 0%';
  else if (style.widthMode === 'fixed' && style.widthValue !== undefined) css.width = pt(style.widthValue);

  if (style.padding) css.padding = style.padding.map(pt).join(' ');
  if (style.margin) css.margin = style.margin.map(pt).join(' ');

  if (style.fontFamily) css.fontFamily = FONT_FAMILIES[style.fontFamily];
  if (style.fontSize !== undefined) css.fontSize = pt(style.fontSize);
  if (style.fontWeight) css.fontWeight = style.fontWeight;
  if (style.italic) css.fontStyle = 'italic';
  if (style.color) css.color = resolveColor(style.color, palette);
  if (style.lineHeight !== undefined) css.lineHeight = style.lineHeight;
  if (style.letterSpacing !== undefined) css.letterSpacing = pt(style.letterSpacing);
  if (style.textTransform) css.textTransform = style.textTransform;

  if (style.background) css.background = resolveColor(style.background, palette);
  if (style.borderRadius !== undefined) css.borderRadius = pt(style.borderRadius);
  if (style.border) {
    css.border = `${pt(style.border.width)} ${style.border.style} ${resolveColor(style.border.color, palette)}`;
  }
  if (style.opacity !== undefined) css.opacity = style.opacity;

  return css;
}

function toFlexAlign(align: 'start' | 'center' | 'end' | undefined): React.CSSProperties['alignItems'] {
  if (align === 'center') return 'center';
  if (align === 'end') return 'flex-end';
  if (align === 'start') return 'flex-start';
  return undefined;
}

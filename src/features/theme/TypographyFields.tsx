import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Bold, Italic } from 'lucide-react';
import { FONT_OPTIONS } from './fonts';
import { Row } from './inspectorPrimitives';
import { PALETTE_ROLES } from './paletteRoles';
import type { FontRef, Palette, TypographyStyle } from '@/types/theme';

interface TypographyFieldsProps {
  value: TypographyStyle;
  onChange: (patch: Partial<TypographyStyle>) => void;
  palette: Palette;
}

export function TypographyFields({ value, onChange, palette }: TypographyFieldsProps) {
  return (
    <>
      <Row label="Font">
        <Select value={value.fontFamily ?? '__default'} onValueChange={v => onChange({ fontFamily: v === '__default' ? undefined : (v as FontRef) })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__default">Default</SelectItem>
            {FONT_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Row>
      <Row label="Font size (pt)">
        <Slider min={6} max={48} step={0.5} value={[value.fontSize ?? 10]} onValueChange={([v]) => onChange({ fontSize: v })} />
      </Row>
      <Row label="Weight / style">
        <div className="flex gap-1">
          <Toggle pressed={value.fontWeight === 700} onPressedChange={p => onChange({ fontWeight: p ? 700 : 400 })}><Bold className="h-3.5 w-3.5" /></Toggle>
          <Toggle pressed={!!value.italic} onPressedChange={p => onChange({ italic: p })}><Italic className="h-3.5 w-3.5" /></Toggle>
        </div>
      </Row>
      <Row label="Text color">
        <div className="flex flex-wrap gap-1">
          {PALETTE_ROLES.map(r => (
            <button key={r} type="button" onClick={() => onChange({ color: r })} className="h-6 w-6 rounded-full border border-border" style={{ background: palette[r], outline: value.color === r ? '2px solid var(--primary,#2563eb)' : undefined }} title={r} />
          ))}
        </div>
      </Row>
      <Row label="Background">
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => onChange({ background: undefined })} className="h-6 w-6 rounded-full border border-dashed border-border text-[8px]" title="None">✕</button>
          {PALETTE_ROLES.map(r => (
            <button key={r} type="button" onClick={() => onChange({ background: r })} className="h-6 w-6 rounded-full border border-border" style={{ background: palette[r], outline: value.background === r ? '2px solid var(--primary,#2563eb)' : undefined }} title={r} />
          ))}
        </div>
      </Row>
      <Row label="Border">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => onChange({ border: null })}
              className="h-6 w-6 rounded-full border border-dashed border-border text-[8px]"
              title="None"
            >
              ✕
            </button>
            {PALETTE_ROLES.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ border: { width: value.border?.width ?? 1, style: value.border?.style ?? 'solid', color: r } })}
                className="h-6 w-6 rounded-full border border-border"
                style={{ background: palette[r], outline: value.border && value.border.color === r ? '2px solid var(--primary,#2563eb)' : undefined }}
                title={r}
              />
            ))}
          </div>
          {value.border && (
            <>
              <Slider min={0.5} max={8} step={0.5} value={[value.border.width]} onValueChange={([v]) => onChange({ border: { ...value.border!, width: v } })} />
              <ToggleGroup type="single" value={value.border.style} onValueChange={v => v && onChange({ border: { ...value.border!, style: v as 'solid' | 'dashed' | 'dotted' } })} className="w-full">
                <ToggleGroupItem value="solid" className="flex-1 text-xs">Solid</ToggleGroupItem>
                <ToggleGroupItem value="dashed" className="flex-1 text-xs">Dashed</ToggleGroupItem>
                <ToggleGroupItem value="dotted" className="flex-1 text-xs">Dotted</ToggleGroupItem>
              </ToggleGroup>
            </>
          )}
        </div>
      </Row>
    </>
  );
}

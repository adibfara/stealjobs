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

export function ImagesBlock({ ss, accentColor = '#333' }: { ss: SubSection; accentColor?: string }) {
  const allImages = (ss.images ?? []).filter(img => img.title || img.imageLink);
  if (allImages.length === 0) return null;
  const cardView = ss.imagesCardView ?? false;

  if (cardView) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6pt', marginTop: '6pt' }}>
        {allImages.map(img => {
          const inner = (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', background: '#f9f9f9', border: '0.5pt solid #e0e0e0', borderRadius: '5pt', padding: '5pt', overflow: 'hidden' }}>
              {img.imageLink && (
                <img
                  src={img.imageLink}
                  alt={img.title}
                  style={{ width: '54pt', height: '34pt', objectFit: 'cover', borderRadius: '3pt', flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '9pt', color: accentColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.title}</div>
                {img.subtitle && (
                  <div style={{ fontSize: '8pt', color: '#777', marginTop: '1pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.subtitle}</div>
                )}
              </div>
            </div>
          );
          return img.link
            ? <a key={img.id} href={img.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
            : <div key={img.id}>{inner}</div>;
        })}
      </div>
    );
  }

  const images = allImages.filter(img => img.imageLink);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8pt', marginTop: '6pt' }}>
      {images.map(img => {
        const inner = (
          <div style={{ width: '120pt', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '120pt', paddingTop: '67.5pt', borderRadius: '4pt', overflow: 'hidden', background: '#eee' }}>
              <img
                src={img.imageLink}
                alt={img.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {img.subtitle && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '7pt', padding: '2pt 4pt', lineHeight: 1.3 }}>
                  {img.subtitle}
                </div>
              )}
            </div>
            <div style={{ fontSize: '8.5pt', fontWeight: 600, color: accentColor, marginTop: '3pt', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.title}</div>
          </div>
        );
        return img.link
          ? <a key={img.id} href={img.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>
          : <div key={img.id}>{inner}</div>;
      })}
    </div>
  );
}

export type { ResumeData, SubSection };

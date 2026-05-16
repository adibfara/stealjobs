import * as React from 'react';
import { LinkedText, TemplateIcon, ImagesBlock } from './shared';
import type { ResumeData, SubSection } from './shared';

interface Props {
  resume: ResumeData;
}

function SubSectionRender({ ss }: { ss: SubSection }) {
  return (
    <div style={{ marginBottom: '12pt' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2pt' }}>
        <div style={{ flex: 1 }}>
          {ss.title && (
            <LinkedText
              text={ss.title}
              link={ss.titleLink}
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '10.5pt',
                color: '#1a1a2e',
                fontFamily: "'Instrument Sans', sans-serif",
              }}
            />
          )}
          {ss.type !== 2 && ss.subtitle && (
            <LinkedText
              text={ss.subtitle}
              link={ss.subtitleLink}
              style={{
                display: 'block',
                fontSize: '9.5pt',
                color: '#16213e',
                fontStyle: 'italic',
                opacity: 0.75,
              }}
            />
          )}
        </div>
        {ss.date && (
          <LinkedText
            text={ss.date}
            link={ss.dateLink}
            style={{
              fontSize: '8.5pt',
              color: '#0f3460',
              background: '#e8f0fe',
              padding: '1pt 6pt',
              borderRadius: '10pt',
              whiteSpace: 'nowrap',
              marginLeft: '8pt',
              marginTop: '1pt',
            }}
          />
        )}
      </div>

      {(() => {
        const ft = ss.tags.filter(t => t.text);
        if (!ft.length) return null;
        if (ss.tagsPosition !== 'top' && ss.type !== 3) return null;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3pt', marginBottom: '4pt', marginTop: '3pt' }}>
            {ft.map(tag => (
              <span key={tag.id} style={{ fontSize: '8pt', background: '#0f3460', color: '#fff', borderRadius: '3pt', padding: '1pt 5pt' }}>
                {tag.text}
              </span>
            ))}
          </div>
        );
      })()}

      {ss.text && (
        <p style={{ margin: '3pt 0 4pt 0', fontSize: '9.5pt', color: '#2d2d44', lineHeight: 1.45, textAlign: 'justify' }}>
          {ss.text}
        </p>
      )}

      {ss.bullets.filter(b => b.text).length > 0 && (
        <ul style={{ margin: '4pt 0 0 0', paddingLeft: '14pt', listStyleType: 'none' }}>
          {ss.bullets.filter(b => b.text).map(b => (
            <li key={b.id} style={{ fontSize: '9.5pt', color: '#2d2d44', marginBottom: '2pt', lineHeight: 1.45, position: 'relative', paddingLeft: '10pt' }}>
              <span style={{ position: 'absolute', left: 0, top: '5pt', width: '4pt', height: '4pt', borderRadius: '50%', background: '#0f3460' }} />
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}

      {(() => {
        const ft = ss.tags.filter(t => t.text);
        if (!ft.length) return null;
        if (ss.tagsPosition === 'top' || ss.type === 3) return null;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3pt', marginTop: '5pt' }}>
            {ft.map(tag => (
              <span key={tag.id} style={{ fontSize: '8pt', background: '#e8f0fe', color: '#0f3460', borderRadius: '3pt', padding: '1.5pt 6pt', border: '0.5pt solid #c5d8f7' }}>
                {tag.text}
              </span>
            ))}
          </div>
        );
      })()}

      <ImagesBlock ss={ss} accentColor="#0f3460" />
    </div>
  );
}

export function ModernTemplate({ resume }: Props) {
  const accentBg = '#0f3460';
  const accentLight = '#16213e';

  return (
    <div
      style={{
        fontFamily: "'Instrument Sans', 'Geist Variable', sans-serif",
        fontSize: '10pt',
        color: '#222',
        backgroundColor: '#fff',
        display: 'flex',
        minHeight: '100%',
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          width: '200pt',
          minWidth: '200pt',
          background: accentBg,
          color: '#fff',
          padding: '32pt 18pt',
          display: 'flex',
          flexDirection: 'column',
          gap: '20pt',
        }}
      >
        {/* Name / title */}
        <div>
          {resume.title && (
            <LinkedText
              text={resume.title}
              link={resume.titleLink}
              style={{
                display: 'block',
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: '18pt',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.15,
                marginBottom: '5pt',
              }}
            />
          )}
          {resume.subtitle && (
            <LinkedText
              text={resume.subtitle}
              link={resume.subtitleLink}
              style={{
                display: 'block',
                fontSize: '9pt',
                color: 'rgba(255,255,255,0.7)',
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}
            />
          )}
        </div>

        {/* Contacts */}
        {resume.contacts.length > 0 && (
          <div>
            <div
              style={{
                fontSize: '7.5pt',
                letterSpacing: '1pt',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '8pt',
                fontWeight: 600,
              }}
            >
              Contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6pt' }}>
              {resume.contacts.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6pt' }}>
                  <span style={{ opacity: 0.7, flexShrink: 0 }}>
                    <TemplateIcon name={c.icon} size={11} />
                  </span>
                  <LinkedText
                    text={c.text}
                    link={c.link}
                    style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.85)', lineHeight: 1.3, wordBreak: 'break-all' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32pt 28pt', backgroundColor: '#fff' }}>
        {resume.sections.map(section => (
          <div key={section.id} style={{ marginBottom: '16pt' }}>
            {section.title && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8pt',
                  marginBottom: '8pt',
                }}
              >
                <LinkedText
                  text={section.title}
                  link={section.titleLink}
                  style={{
                    fontSize: '9pt',
                    fontWeight: 700,
                    letterSpacing: '1.5pt',
                    textTransform: 'uppercase',
                    color: accentBg,
                  }}
                />
                <div style={{ flex: 1, height: '1pt', background: '#d0dff5' }} />
              </div>
            )}
            {section.subsections.map(ss => (
              <SubSectionRender key={ss.id} ss={ss} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

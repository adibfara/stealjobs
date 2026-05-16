import * as React from 'react';
import { LinkedText, TemplateIcon, ImagesBlock } from './shared';
import type { ResumeData, SubSection } from './shared';
import { classicTheme as t } from './templateThemes';

interface Props {
  resume: ResumeData;
}

function SubSectionRender({ ss }: { ss: SubSection }) {
  const hasTitleRow = ss.title || ss.subtitle || ss.date;
  const showSubtitle = ss.type !== 2 && ss.subtitle;

  return (
    <div style={{ marginBottom: t.subsectionGap }}>
      {hasTitleRow && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
          <div style={{ flex: 1 }}>
            {ss.title && (
              <LinkedText
                text={ss.title}
                link={ss.titleLink}
                style={{ fontWeight: 600, fontSize: t.sizeSubsectionTitle, color: t.colorText }}
              />
            )}
            {showSubtitle && (
              <>
                {ss.title && <span style={{ color: t.colorMuted, fontSize: t.sizeBody }}> Â· </span>}
                <LinkedText
                  text={ss.subtitle}
                  link={ss.subtitleLink}
                  style={{ fontStyle: 'italic', fontSize: t.sizeBody, color: t.colorMuted }}
                />
              </>
            )}
          </div>
          {ss.date && (
            <LinkedText
              text={ss.date}
              link={ss.dateLink}
              style={{ fontSize: t.sizeSmall, color: t.colorFaint, marginLeft: '12pt', whiteSpace: 'nowrap' }}
            />
          )}
        </div>
      )}

      {(() => {
        const filteredTags = ss.tags.filter(t => t.text);
        if (filteredTags.length === 0) return null;
        const isTop = ss.tagsPosition === 'top';
        const isType3 = ss.type === 3;
        if (!isTop && !isType3) return null;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt', marginBottom: '4pt' }}>
            {filteredTags.map(tag => (
              <span key={tag.id} style={{ fontSize: t.sizeTiny, background: t.tagSecondaryBg, border: t.tagSecondaryBorder, borderRadius: '3pt', padding: '1pt 5pt', color: t.tagSecondaryColor }}>
                {tag.text}
              </span>
            ))}
          </div>
        );
      })()}

      {ss.text && (
        <p style={{ margin: '3pt 0 4pt 0', fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.4, textAlign: 'justify' }}>
          {ss.text}
        </p>
      )}

      {ss.bullets.filter(b => b.text).length > 0 && (
        <ul style={{ margin: '3pt 0 0 0', paddingLeft: '14pt', listStyleType: 'disc' }}>
          {ss.bullets.filter(b => b.text).map(b => (
            <li key={b.id} style={{ fontSize: t.sizeBody, color: t.colorText, marginBottom: '2pt', lineHeight: 1.4 }}>
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}

      {(() => {
        const filteredTags = ss.tags.filter(tg => tg.text);
        if (filteredTags.length === 0) return null;
        if (ss.tagsPosition === 'top' || ss.type === 3) return null;
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt', marginTop: '4pt' }}>
            {filteredTags.map(tag => (
              <span key={tag.id} style={{ fontSize: t.sizeTiny, background: t.tagSecondaryBg, border: t.tagSecondaryBorder, borderRadius: '3pt', padding: '1pt 5pt', color: t.tagSecondaryColor }}>
                {tag.text}
              </span>
            ))}
          </div>
        );
      })()}

      <ImagesBlock ss={ss} accentColor={t.colorAccent} />
    </div>
  );
}

export function ClassicTemplate({ resume }: Props) {
  return (
    <div
      style={{
        fontFamily: t.fontBody,
        fontSize: t.sizeBody,
        color: t.colorText,
        backgroundColor: t.colorBg,
        padding: `${t.pagePaddingV} ${t.pagePaddingH}`,
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '16pt' }}>
        {resume.photo && (
          <div style={{ marginBottom: '10pt' }}>
            <img
              src={resume.photo}
              alt=""
              style={{
                width: '72pt',
                height: '72pt',
                borderRadius: '50%',
                objectFit: 'cover',
                display: 'inline-block',
              }}
            />
          </div>
        )}
        {resume.title && (
          <LinkedText
            text={resume.title}
            link={resume.titleLink}
            style={{
              display: 'block',
              fontFamily: t.fontDisplay,
              fontSize: t.sizeTitle,
              fontWeight: 400,
              letterSpacing: '-0.5pt',
              color: t.colorText,
              lineHeight: 1.1,
              marginBottom: '4pt',
            }}
          />
        )}
        {resume.subtitle && (
          <LinkedText
            text={resume.subtitle}
            link={resume.subtitleLink}
            style={{
              display: 'block',
              fontSize: t.sizeSubtitle,
              fontStyle: 'italic',
              color: t.colorAccentLight,
              marginBottom: '8pt',
            }}
          />
        )}

        {resume.contacts.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '4pt 12pt',
              fontSize: t.sizeSmall,
              color: t.colorMuted,
              marginTop: '6pt',
            }}
          >
            {resume.contacts.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 && <span style={{ color: '#bbb' }}>Â·</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                  <TemplateIcon name={c.icon} size={10} />
                  <LinkedText text={c.text} link={c.link} style={{ color: t.colorMuted }} />
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: `${t.dividerWidth} solid ${t.dividerColor}`, marginBottom: '14pt' }} />

      {resume.sections.map(section => (
        <div key={section.id} style={{ marginBottom: t.sectionGap }}>
          {section.title && (
            <div style={{ marginBottom: '6pt' }}>
              <LinkedText
                text={section.title}
                link={section.titleLink}
                style={{
                  display: 'block',
                  fontFamily: t.fontDisplay,
                  fontSize: t.sizeSectionHeading,
                  fontWeight: 400,
                  letterSpacing: '0.5pt',
                  textTransform: 'uppercase',
                  color: t.colorText,
                  borderBottom: `0.5pt solid ${t.dividerColor}`,
                  paddingBottom: '3pt',
                  marginBottom: '6pt',
                }}
              />
            </div>
          )}
          {section.subsections.map(ss => (
            <SubSectionRender key={ss.id} ss={ss} />
          ))}
        </div>
      ))}
    </div>
  );
}

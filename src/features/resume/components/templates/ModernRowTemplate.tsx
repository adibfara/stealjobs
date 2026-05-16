import * as React from 'react';
import type {ResumeData, SubSection} from './shared';
import {ImagesBlock, LinkedText, TemplateIcon} from './shared';
import {modernTheme as t} from './templateThemes';

interface Props {
    resume: ResumeData;
}

function SubSectionRender({ss}: { ss: SubSection }) {
    return (
        <div style={{marginBottom: t.subsectionGap}}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2pt'
            }}>
                <div style={{flex: 1}}>
                    {ss.title && (
                        <LinkedText
                            text={ss.title}
                            link={ss.titleLink}
                            style={{
                                display: 'block',
                                fontWeight: 600,
                                fontSize: t.sizeSubsectionTitle,
                                color: t.colorText,
                                fontFamily: t.fontBody,
                            }}
                        />
                    )}
                    {ss.type !== 2 && ss.subtitle && (
                        <LinkedText
                            text={ss.subtitle}
                            link={ss.subtitleLink}
                            style={{
                                display: 'block',
                                fontSize: t.sizeBody,
                                color: t.colorMuted,
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
                            fontSize: t.sizeSmall,
                            color: t.colorAccent,
                            background: t.colorAccentLight,
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
                const ft = ss.tags.filter(tg => tg.text);
                if (!ft.length) return null;
                if (ss.tagsPosition !== 'top' && ss.type !== 3) return null;
                return (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '3pt', marginBottom: '4pt', marginTop: '3pt'}}>
                        {ft.map(tag => (
                            <span key={tag.id} style={{
                                fontSize: t.sizeTiny,
                                background: t.tagSecondaryBg,
                                color: t.tagSecondaryColor,
                                borderRadius: '3pt',
                                padding: '1pt 5pt',
                                border: t.tagSecondaryBorder
                            }}>
                {tag.text}
              </span>
                        ))}
                    </div>
                );
            })()}

            {ss.text && (
                <p style={{
                    margin: '3pt 0 4pt 0',
                    fontSize: t.sizeBody,
                    color: t.colorFaint,
                    lineHeight: 1.45,
                    textAlign: 'justify'
                }}>
                    {ss.text}
                </p>
            )}

            {ss.bullets.filter(b => b.text).length > 0 && (
                <ul style={{margin: '4pt 0 0 0', paddingLeft: '14pt', listStyleType: 'none'}}>
                    {ss.bullets.filter(b => b.text).map(b => (
                        <li key={b.id} style={{
                            fontSize: t.sizeBody,
                            color: t.colorFaint,
                            marginBottom: '2pt',
                            lineHeight: 1.45,
                            position: 'relative',
                            paddingLeft: '10pt'
                        }}>
                            <span style={{
                                position: 'absolute',
                                left: 0,
                                top: '5pt',
                                width: '4pt',
                                height: '4pt',
                                borderRadius: '50%',
                                background: t.colorAccent
                            }}/>
                            <LinkedText text={b.text} link={b.link}/>
                        </li>
                    ))}
                </ul>
            )}

            {(() => {
                const ft = ss.tags.filter(tg => tg.text);
                if (!ft.length) return null;
                if (ss.tagsPosition === 'top' || ss.type === 3) return null;
                return (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '3pt', marginTop: '5pt'}}>
                        {ft.map(tag => (
                            <span key={tag.id} style={{
                                fontSize: t.sizeTiny,
                                background: t.tagSecondaryBg,
                                color: t.tagSecondaryColor,
                                borderRadius: '5pt',
                                padding: '1.5pt 6pt',
                                border: t.tagSecondaryBorder
                            }}>
                {tag.text}
              </span>
                        ))}
                    </div>
                );
            })()}

            <ImagesBlock ss={ss} accentColor={t.colorAccent}/>
        </div>
    );
}

export function ModernRowTemplate({resume}: Props) {
    return (
        <div
            style={{
                fontFamily: t.fontBody,
                fontSize: '10pt',
                color: '#222',
                backgroundColor: t.colorBg,
                display: 'flex',
                minHeight: '100%',
                flexDirection: 'column'
            }}
        >
            {/* Top header bar */}
            <div
                style={{
                    background: t.colorBg,
                    color: t.colorText,
                    padding: `${t.pagePaddingV} ${t.pagePaddingH}`,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20pt',
                }}
            >
                {/* Left: photo + name/occupation */}
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16pt'}}>
                    {resume.photo && (
                        <img
                            src={resume.photo}
                            alt=""
                            style={{
                                width: '80pt',
                                height: '80pt',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: `2pt solid ${t.colorAccentLight}`,
                                flexShrink: 0,
                            }}
                        />
                    )}
                    <div>
                        {resume.title && (
                            <LinkedText
                                text={resume.title}
                                link={resume.titleLink}
                                style={{
                                    display: 'block',
                                    fontFamily: t.fontDisplay,
                                    fontSize: t.sizeTitle,
                                    fontWeight: 400,
                                    color: t.colorText,
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
                                    fontSize: t.sizeSubtitle,
                                    color: t.colorMuted,
                                    lineHeight: 1.4,
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Right: contacts */}
                {resume.contacts.length > 0 && (
                    <div style={{display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6pt 6pt', alignItems: 'center'}}>
                        {resume.contacts.map(c => (
                            <React.Fragment key={c.id}>
                                <span style={{opacity: 0.7, flexShrink: 0, display: 'flex', alignItems: 'center'}}>
                                    <TemplateIcon name={c.icon} size={11}/>
                                </span>
                                <LinkedText
                                    text={c.text}
                                    link={c.link}
                                    style={{
                                        fontSize: t.sizeSmall,
                                        color: t.colorFaint,
                                        lineHeight: 1.3,
                                        wordBreak: 'break-all'
                                    }}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* Main content */}
            <div style={{flex: 1, padding: `${t.pagePaddingV} ${t.pagePaddingH}`, backgroundColor: t.colorBg}}>
                {resume.sections.map(section => (
                    <div key={section.id} style={{marginBottom: t.sectionGap}}>
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
                                        fontSize: t.sizeSectionHeading,
                                        fontWeight: 700,
                                        letterSpacing: '1.5pt',
                                        textTransform: 'uppercase',
                                        color: t.colorAccent,
                                    }}
                                />
                                <div style={{flex: 1, height: t.dividerWidth, background: t.dividerColor}}/>
                            </div>
                        )}
                        {section.subsections.map(ss => (
                            <SubSectionRender key={ss.id} ss={ss}/>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

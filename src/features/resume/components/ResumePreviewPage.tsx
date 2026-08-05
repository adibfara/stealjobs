import * as React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Printer, FileDown, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getResume } from '@/lib/resumeStorage';
import { TEMPLATES, COVER_LETTER_TEMPLATES, getTemplate, getCoverLetterTemplate } from './templates';
import { exportToWord } from '@/lib/wordExport';
import type { ResumeData } from '@/types/resume';
import { getThemes, resolveTheme } from '@/lib/themeStorage';
import { builtinThemes } from '@/features/theme/builtinThemes';
import { ThemeRenderer } from '@/features/theme/ThemeRenderer';
import type { ThemeData } from '@/types/theme';

function printResume(resume: ResumeData) {
  const prev = document.title;
  document.title = `${resume.name} - Resume`;
  window.print();
  // restore after print dialog closes
  window.addEventListener('afterprint', () => { document.title = prev; }, { once: true });
}

export function ResumePreviewPage() {
  const { resumeId } = useParams({ from: '/resume/$resumeId/preview' });
  const navigate = useNavigate();
  const [resume, setResume] = React.useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = React.useState('modern-row');
  const [showTemplateMenu, setShowTemplateMenu] = React.useState(false);
  const [customThemes, setCustomThemes] = React.useState<ThemeData[]>([]);

  React.useEffect(() => {
    getThemes().then(setCustomThemes);
  }, []);

  // Load resume once
  React.useEffect(() => {
    let cancelled = false;
    getResume(resumeId).then(r => {
      if (cancelled) return;
      if (!r) { navigate({ to: '/' }); return; }
      setResume(r);
      setTemplateId(r.selectedTemplate ?? 'modern-row');
    });
    return () => { cancelled = true; };
  }, [resumeId]);

  // Auto-refresh to reflect edits made in the editor tab (offline cache keeps this cheap).
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const r = await getResume(resumeId);
      if (r) setResume(r);
    }, 3000);
    return () => clearInterval(interval);
  }, [resumeId]);

  const isCoverLetter = resume?.type === 'coverletter';
  const codeTemplates = isCoverLetter ? COVER_LETTER_TEMPLATES : TEMPLATES;
  const themeOptions = isCoverLetter ? [] : [...builtinThemes, ...customThemes];
  const themeIds = new Set(themeOptions.map(t => t.id));
  const availableOptions = [
    ...codeTemplates.filter(t => !themeIds.has(t.id)).map(t => ({ id: t.id, name: t.name })),
    ...themeOptions.map(t => ({ id: t.id, name: t.name })),
  ];

  const activeTheme = !isCoverLetter ? resolveTheme(templateId, customThemes) : null;
  const codeTemplateFallback = isCoverLetter ? getCoverLetterTemplate(templateId) : getTemplate(templateId);
  const template = activeTheme ? { id: activeTheme.id, name: activeTheme.name } : codeTemplateFallback;
  const TemplateComponent = activeTheme ? null : codeTemplateFallback.component;

  if (!resume) return null;

  return (
    <>
      {/* Top bar — hidden on print */}
      <div className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-sm">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/resume/$resumeId', params: { resumeId } })}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Edit
        </Button>

        <div className="flex-1" />

        {/* Template selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTemplateMenu(m => !m)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            {template.name}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {showTemplateMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTemplateMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                {availableOptions.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTemplateId(t.id); setShowTemplateMenu(false); }}
                    className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-accent ${templateId === t.id ? 'bg-accent font-medium' : ''}`}
                  >
                    {t.name}
                    {templateId === t.id && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => printResume(resume)}>
          <Printer className="mr-1.5 h-4 w-4" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportToWord(resume)}>
          <FileText className="mr-1.5 h-4 w-4" /> Export Word
        </Button>
        <Button size="sm" onClick={() => printResume(resume)}>
          <FileDown className="mr-1.5 h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Resume render area */}
      <div className="no-print flex min-h-screen justify-center bg-muted/30 py-8">
        <div
          id="resume-print-area"
          className="resume-paper w-full shadow-2xl"
          style={{ maxWidth: '850px', backgroundColor: '#fff', minHeight: '1100px' }}
        >
          {activeTheme ? <ThemeRenderer theme={activeTheme} resume={resume} /> : TemplateComponent && <TemplateComponent resume={resume} />}
        </div>
      </div>

      {/* Print-only render: full page, no wrapper */}
      <div className="print-only hidden">
        <div id="resume-print-area-print">
          {activeTheme ? <ThemeRenderer theme={activeTheme} resume={resume} /> : TemplateComponent && <TemplateComponent resume={resume} />}
        </div>
      </div>
    </>
  );
}

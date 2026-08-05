import type { ResumeData, Section, SubSection, Contact, Bullet, Tag, ImageItem } from '@/types/resume';
import type { Binding, Condition, RepeatSource } from '@/types/theme';

export interface Scope {
  resume: ResumeData;
  section?: Section;
  subsection?: SubSection;
  contact?: Contact;
  bullet?: Bullet;
  tag?: Tag;
  image?: ImageItem;
}

export function resolveCollection(repeat: RepeatSource, scope: Scope): unknown[] {
  switch (repeat) {
    case 'contacts': return scope.resume.contacts;
    case 'sections': return scope.resume.sections;
    case 'subsections': return scope.section?.subsections ?? [];
    case 'bullets': return (scope.subsection?.bullets ?? []).filter(b => b.text);
    case 'tags': return (scope.subsection?.tags ?? []).filter(t => t.text);
    case 'images': return (scope.subsection?.images ?? []).filter(i => i.title || i.imageLink);
  }
}

export function extendScope(scope: Scope, repeat: RepeatSource, item: unknown): Scope {
  switch (repeat) {
    case 'contacts': return { ...scope, contact: item as Contact };
    case 'sections': return { ...scope, section: item as Section };
    case 'subsections': return { ...scope, subsection: item as SubSection };
    case 'bullets': return { ...scope, bullet: item as Bullet };
    case 'tags': return { ...scope, tag: item as Tag };
    case 'images': return { ...scope, image: item as ImageItem };
  }
}

export function itemKey(item: unknown, fallback: number): string {
  if (item && typeof item === 'object' && 'id' in item) return String((item as { id: unknown }).id);
  return String(fallback);
}

export interface Resolved { text?: string; link?: string; src?: string; icon?: string }

export function resolveBinding(binding: Binding | undefined, scope: Scope): Resolved {
  if (!binding) return {};
  if (typeof binding === 'object') return { text: binding.literal, src: binding.literal };
  switch (binding) {
    case 'resume.title': return { text: scope.resume.title, link: scope.resume.titleLink };
    case 'resume.subtitle': return { text: scope.resume.subtitle, link: scope.resume.subtitleLink };
    case 'resume.photo': return { src: scope.resume.photo };
    case 'resume.name': return { text: scope.resume.name };
    case 'contact.icon': return { icon: scope.contact?.icon };
    case 'contact.text': return { text: scope.contact?.text, link: scope.contact?.link };
    case 'section.title': return { text: scope.section?.title, link: scope.section?.titleLink };
    case 'subsection.title': return { text: scope.subsection?.title, link: scope.subsection?.titleLink };
    case 'subsection.subtitle': return { text: scope.subsection?.subtitle, link: scope.subsection?.subtitleLink };
    case 'subsection.date': return { text: scope.subsection?.date, link: scope.subsection?.dateLink };
    case 'subsection.text': return { text: scope.subsection?.text };
    case 'bullet.text': return { text: scope.bullet?.text, link: scope.bullet?.link };
    case 'tag.text': return { text: scope.tag?.text };
    case 'image.title': return { text: scope.image?.title, link: scope.image?.link };
    case 'image.subtitle': return { text: scope.image?.subtitle };
    case 'image.imageLink': return { src: scope.image?.imageLink };
    default: return {};
  }
}

export function evalCondition(cond: Condition, scope: Scope): boolean {
  if ('any' in cond) return cond.any.some(c => evalCondition(c, scope));
  if ('all' in cond) return cond.all.every(c => evalCondition(c, scope));
  if ('fieldPresent' in cond) {
    const r = resolveBinding(cond.fieldPresent, scope);
    return Boolean(r.text || r.src);
  }
  if (cond.field === 'subsection.type') {
    const type = scope.subsection?.type;
    return 'equals' in cond ? type === cond.equals : type !== cond.notEquals;
  }
  if (cond.field === 'subsection.tagsPosition') {
    const pos = scope.subsection?.tagsPosition ?? 'bottom';
    return 'equals' in cond ? pos === cond.equals : pos !== cond.notEquals;
  }
  return true;
}

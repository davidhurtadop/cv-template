import { marked } from '../../vendor/marked/marked.esm.js';
import { KNOWN_SECTIONS } from './schema.js';
import { contactIcon, iconHref, networkIcon } from './icons.js';
import { techEntry } from './tech.js';

// "OPTIMA CONSULTING" -> "OC", "ENCORA" -> "EN".
const initialsOf = (company = '') => {
  const words = company.split(/[\s/]+/).filter((w) => /\p{L}/u.test(w));
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '').slice(0, 2)).toUpperCase();
};

const inline = (md) => marked.parseInline(md ?? '');
const block = (md) => marked.parse(md ?? '');

// "**Degree** — School, City (2005 – 2015)" -> title, organisation and period for timeline layouts.
// Lines that do not follow the "title — organisation (period)" shape keep everything in the title.
function timelineParts(md) {
  const m = md.match(/^(.+?)\s+—\s+(.+?)(?:\s+\(([^()]+)\))?$/);
  if (!m) return { titleHtml: inline(md), orgHtml: '', period: '' };
  return { titleHtml: inline(m[1].replace(/^\*\*(.+)\*\*$/, '$1')), orgHtml: inline(m[2]), period: m[3] ?? '' };
}

function contactHref(key, value) {
  if (key === 'email') return `mailto:${value}`;
  if (key === 'phone') return `tel:${value.replace(/[^\d+]/g, '')}`;
  return /^https?:\/\//.test(value) ? value : '';
}

/**
 * Turn parsed CV data into the flat object layouts read through data-cv paths.
 * Author content is trusted markdown; it is not sanitised.
 */
export function buildViewModel(cv, ui = {}) {
  const sectionOf = (id) => cv.sections.find((s) => s.id === id);
  const pairs = (id) => (sectionOf(id)?.pairs ?? []).map((p) => ({
    ...p,
    html: inline(p.value),
    href: contactHref(p.key, p.value),
    plain: contactHref(p.key, p.value) ? '' : inline(p.value),
    icon: contactIcon(p.key) ? iconHref(contactIcon(p.key)) : '',
  }));
  const entries = (id) => (sectionOf(id)?.entries ?? []).map((e) => ({
    ...e,
    descriptionHtml: inline(e.description),
    bullets: e.bullets.map((md) => ({ html: inline(md) })),
    tags: e.tags.map((label) => ({ label })),
    tagText: e.tags.join(', '),
    mainTags: e.tags.slice(0, 4).map((label) => ({ label })),
    // Card text: the description followed by the first key result, for a bit more detail.
    summaryHtml: inline([e.description, e.bullets[0]].filter(Boolean).join(' ')),
    // Company logo from front matter `logos:` (keyed by the company text); otherwise a monogram.
    logo: cv.meta.logos?.[e.company] ?? '',
    initials: cv.meta.logos?.[e.company] ? '' : initialsOf(e.company),
  }));
  const items = (id) => (sectionOf(id)?.items ?? []).map((md) => ({ html: inline(md), ...timelineParts(md) }));

  const vm = {
    ui,
    lang: cv.meta.lang,
    title: cv.meta.title ?? cv.name,
    description: cv.meta.description ?? '',
    name: cv.name,
    tagline: cv.tagline,
    headline: cv.meta.headline ?? [],
    headlineText: (cv.meta.headline ?? []).join(', '),
    headlineJson: JSON.stringify(cv.meta.headline ?? []),
    year: String(new Date().getFullYear()),
    // The tagline is only shown in the hero when there are no animated headline titles.
    taglineFallback: (cv.meta.headline ?? []).length ? '' : cv.tagline,
    tech: (cv.meta.tech ?? []).map(techEntry),
    techStyle: `--marquee-duration: ${Math.max(20, (cv.meta.tech ?? []).length * 3.5)}s`,
    heroImage: cv.meta.hero_image ?? '',
    heroStyle: cv.meta.hero_image ? `background-image: url('${cv.meta.hero_image}')` : '',
    heroFlag: cv.meta.hero_image ? 'true' : '',
    // Optional light version, shown by layouts in the light theme only.
    heroLightStyle: cv.meta.hero_image && cv.meta.hero_image_light ? `background-image: url('${cv.meta.hero_image_light}')` : '',
    heroLightFlag: cv.meta.hero_image && cv.meta.hero_image_light ? 'true' : '',
    photo: cv.meta.photo ?? '',
    social: (cv.meta.social ?? []).map((s) => ({
      network: s.network,
      url: s.url,
      label: s.label ?? s.network,
      icon: iconHref(networkIcon(s.network)),
    })),
    contact: pairs('contact'),
    // Social links whose URL is not already shown in the contact list (the print view lists both).
    socialExtra: (cv.meta.social ?? [])
      .filter((s) => !(sectionOf('contact')?.pairs ?? []).some((p) => p.value.includes(s.url.replace(/\/$/, ''))))
      .map((s) => ({ label: s.label ?? s.network, url: s.url, display: s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') })),
    summary: sectionOf('summary') ? block(sectionOf('summary').text) : '',
    skills: pairs('skills'),
    languages: pairs('languages'),
    experience: entries('experience'),
    projects: entries('projects'),
    education: items('education'),
    certifications: items('certifications'),
    extra: cv.sections
      .filter((s) => !KNOWN_SECTIONS.includes(s.id))
      .map((s) => ({ id: s.id, title: s.title, html: block(s.text) })),
    t: Object.fromEntries(cv.sections.map((s) => [s.id, s.title])),
    // Short nav labels come from i18n (ui.nav.<id>); sections without one fall back to their title.
    sections: cv.sections.map((s) => ({ id: s.id, title: ui.nav?.[s.id] ?? s.title, href: `#${s.id}` })),
    // Layouts that show contact details next to the name leave them out of their section nav.
    mainSections: cv.sections.filter((s) => s.id !== 'contact')
      .map((s) => ({ id: s.id, title: ui.nav?.[s.id] ?? s.title, href: `#${s.id}` })),
    // Layouts that show education and certifications as columns of the experience section leave them out of their nav.
    timelineSections: cv.sections.filter((s) => !['education', 'certifications'].includes(s.id))
      .map((s) => ({ id: s.id, title: ui.nav?.[s.id] ?? s.title, href: `#${s.id}` })),
    has: Object.fromEntries(cv.sections.map((s) => [s.id, true])),
  };
  vm.has.timeline = Boolean(vm.has.experience || vm.has.education || vm.has.certifications);
  vm.has.study = Boolean(vm.has.education || vm.has.certifications);
  return vm;
}

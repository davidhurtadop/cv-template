import { marked } from '../../vendor/marked/marked.esm.js';
import { KNOWN_SECTIONS } from './schema.js';
import { contactIcon, iconHref, networkIcon } from './icons.js';
import { techEntry } from './tech.js';

const inline = (md) => marked.parseInline(md ?? '');
const block = (md) => marked.parse(md ?? '');

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
  const items = (id) => (sectionOf(id)?.items ?? []).map((md) => ({ html: inline(md) }));

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
    experience: (sectionOf('experience')?.entries ?? []).map((e) => ({
      ...e,
      bullets: e.bullets.map((md) => ({ html: inline(md) })),
    })),
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
    has: Object.fromEntries(cv.sections.map((s) => [s.id, true])),
  };
  return vm;
}

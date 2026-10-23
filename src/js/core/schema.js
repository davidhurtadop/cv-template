// Section ids the engine understands, in the order layouts normally show them.
// Any other id is rendered as a generic text section.
export const KNOWN_SECTIONS = [
  'contact', 'summary', 'skills', 'experience', 'education', 'certifications', 'languages',
];

// How the body of each known section is parsed.
export const SECTION_KINDS = {
  contact: 'pairs',
  skills: 'pairs',
  languages: 'pairs',
  summary: 'text',
  experience: 'entries',
  education: 'list',
  certifications: 'list',
};

export const REQUIRED_META = ['lang', 'title'];

// Selectable page layouts (folders in src/layouts/). `print` is the A4 view and is always loaded.
export const LAYOUTS = ['horizon', 'ledger'];

// Contact/skills labels are turned into language-independent keys so `hide: [phone]`, icons and
// mailto:/tel: links work in every language. Add a row (or write `**Label {#phone}:**` in the
// markdown) for a language that is not listed.
export const KEY_ALIASES = {
  phone: ['phone', 'mobile', 'telefono', 'celular', 'movil', 'telefone', 'telephone', 'telefon'],
  email: ['email', 'e-mail', 'mail', 'correo', 'correo-electronico', 'courriel', 'e-mail-adresse'],
  location: ['location', 'address', 'ubicacion', 'ciudad', 'direccion', 'localizacao', 'localisation', 'adresse', 'standort'],
  website: ['website', 'web', 'sitio-web', 'pagina-web', 'site', 'webseite'],
};

export function canonicalKey(slugged) {
  for (const [key, aliases] of Object.entries(KEY_ALIASES)) {
    if (aliases.includes(slugged)) return key;
  }
  return slugged;
}

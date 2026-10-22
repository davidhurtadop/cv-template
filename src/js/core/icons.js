// Icon ids available in vendor/bootstrap-icons/icons.svg (see vendor/VERSIONS.md to add more).
export const SOCIAL_NETWORKS = [
  'linkedin', 'github', 'twitter-x', 'instagram', 'youtube', 'facebook',
  'mastodon', 'bluesky', 'medium', 'stack-overflow', 'telegram', 'whatsapp',
];

const CONTACT_ICONS = {
  email: 'envelope',
  phone: 'telephone',
  location: 'geo-alt',
  website: 'globe',
  web: 'globe',
};

export const SPRITE_PATH = 'vendor/bootstrap-icons/icons.svg';

export function iconHref(name) {
  return `${SPRITE_PATH}#bi-${name}`;
}

export function networkIcon(network) {
  return SOCIAL_NETWORKS.includes(network) ? network : 'link-45deg';
}

export function contactIcon(key) {
  if (CONTACT_ICONS[key]) return CONTACT_ICONS[key];
  return SOCIAL_NETWORKS.includes(key) ? key : null;
}

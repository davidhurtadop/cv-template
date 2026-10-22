/**
 * Marks the nav link (class `active`) of the section being read; the nav is any element marked `data-spy-nav`. A section counts as current once its top passes
 * 35% of the viewport; at the very bottom of the page the last section wins, so short final
 * sections (like Languages) can still light up.
 */
export function initScrollSpy(navSelector) {
  const nav = document.querySelector(navSelector);
  if (!nav) return;
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const entries = links
    .map((link) => ({ link, section: document.getElementById(link.getAttribute('href').slice(1)) }))
    .filter((entry) => entry.section);
  if (!entries.length) return;

  let ticking = false;
  function update() {
    ticking = false;
    const threshold = window.innerHeight * 0.35;
    let current = null;
    for (const entry of entries) {
      if (entry.section.getBoundingClientRect().top <= threshold) current = entry;
    }
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = entries[entries.length - 1];
    for (const { link } of entries) {
      const active = current?.link === link;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }
  const schedule = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
}

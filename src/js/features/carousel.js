const AUTO_MS = 4000;

/**
 * Wires every [data-carousel]: [data-carousel-prev]/[data-carousel-next] scroll its
 * [data-carousel-track] by one card (disabled at the ends), and the track advances by itself
 * every few seconds, looping to the start. Auto-advance pauses while the pointer or keyboard
 * focus is inside, while the carousel is off screen or the tab is hidden, and when the visitor
 * presses [data-carousel-toggle]. It never runs with prefers-reduced-motion.
 */
export function initCarousels(root = document) {
  for (const carousel of root.querySelectorAll('[data-carousel]')) {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const toggle = carousel.querySelector('[data-carousel-toggle]');
    if (!track) continue;

    const step = () => {
      const item = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.9;
    };
    const atEnd = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 8;
    const update = () => {
      if (prev) prev.disabled = track.scrollLeft <= 8;
      if (next) next.disabled = atEnd();
    };

    prev?.addEventListener('click', () => track.scrollBy({ left: -step() }));
    next?.addEventListener('click', () => track.scrollBy({ left: step() }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) continue;

    let pausedByUser = false;
    let hovering = false;
    let visible = false;
    const advance = () => {
      if (pausedByUser || hovering || !visible || document.hidden) return;
      if (atEnd()) track.scrollTo({ left: 0 });
      else track.scrollBy({ left: step() });
    };
    setInterval(advance, AUTO_MS);

    carousel.addEventListener('pointerenter', () => { hovering = true; });
    carousel.addEventListener('pointerleave', () => { hovering = false; });
    carousel.addEventListener('focusin', () => { hovering = true; });
    carousel.addEventListener('focusout', () => { hovering = false; });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.3 }).observe(carousel);

    toggle?.addEventListener('click', () => {
      pausedByUser = !pausedByUser;
      carousel.toggleAttribute('data-paused', pausedByUser);
      toggle.setAttribute('aria-pressed', String(pausedByUser));
      const label = pausedByUser ? toggle.dataset.labelPlay : toggle.dataset.labelPause;
      if (label) { toggle.setAttribute('aria-label', label); toggle.title = label; }
    });
  }
}

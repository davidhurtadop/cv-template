/**
 * Wires every [data-carousel]: its [data-carousel-track] scrolls by about one card per click on
 * [data-carousel-prev] / [data-carousel-next], and the buttons are disabled at either end.
 */
export function initCarousels(root = document) {
  for (const carousel of root.querySelectorAll('[data-carousel]')) {
    const track = carousel.querySelector('[data-carousel-track]');
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if (!track) continue;

    const step = () => {
      const item = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.9;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 8;
      if (prev) prev.disabled = track.scrollLeft <= 8;
      if (next) next.disabled = track.scrollLeft >= max;
    };

    prev?.addEventListener('click', () => track.scrollBy({ left: -step() }));
    next?.addEventListener('click', () => track.scrollBy({ left: step() }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
}

const TYPE_MS = 70;
const ERASE_MS = 35;
const HOLD_MS = 1800;

/** Types the items of [data-typed] one after another. Static text is kept for reduced motion. */
export function initTyped(root = document) {
  const el = root.querySelector('[data-typed]');
  if (!el) return;
  let items;
  try { items = JSON.parse(el.dataset.items ?? '[]'); } catch { return; }
  if (items.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Screen readers get the full list once; the animated text is hidden from them.
  const spoken = document.createElement('span');
  spoken.className = 'visually-hidden';
  spoken.textContent = items.join(', ');
  el.before(spoken);
  el.setAttribute('aria-hidden', 'true');
  el.textContent = '';
  el.classList.add('is-typing');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  (async function loop() {
    for (let i = 0; ; i = (i + 1) % items.length) {
      for (let n = 1; n <= items[i].length; n++) { el.textContent = items[i].slice(0, n); await wait(TYPE_MS); }
      await wait(HOLD_MS);
      for (let n = items[i].length - 1; n >= 0; n--) { el.textContent = items[i].slice(0, n); await wait(ERASE_MS); }
    }
  })();
}

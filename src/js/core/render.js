// Fills a layout's markup from a view model. Placeholder attributes:
//   data-cv="path"                 text content
//   data-cv-html="path"            inner HTML (already rendered markdown)
//   data-cv-attr="name:path;..."   set attributes (e.g. href:contact.href)
//   data-if="path"                 keep the element only when the value is non-empty
//   <template data-repeat="path">  clone its content once per array item
// Paths resolve against the current item first, then the root view model.

export function get(scopes, path) {
  const parts = path.split('.');
  for (const scope of scopes) {
    let value = scope;
    for (const part of parts) {
      value = value == null ? undefined : value[part];
    }
    if (value !== undefined) return value;
  }
  return undefined;
}

const isEmpty = (v) => v == null || v === '' || v === false || (Array.isArray(v) && !v.length);

export function render(root, vm, report = { unresolved: [] }) {
  fill(root, [vm], report);
  return report;
}

function fill(node, scopes, report) {
  // Nested templates live in their parent template's content, so only top-level ones are found here.
  for (const el of [...node.querySelectorAll('template[data-repeat]')]) {
    expand(el, scopes, report);
  }
  for (const el of [...node.querySelectorAll('[data-if], [data-cv], [data-cv-html], [data-cv-attr]')]) {
    if (!node.contains(el)) continue; // removed along with a data-if ancestor
    if (el.hasAttribute('data-if') && isEmpty(get(scopes, el.getAttribute('data-if')))) {
      el.remove();
      continue;
    }
    apply(el, scopes, report);
  }
}

function expand(template, scopes, report) {
  const items = get(scopes, template.getAttribute('data-repeat'));
  const parent = template.parentNode;
  if (!Array.isArray(items)) {
    report.unresolved.push(template.getAttribute('data-repeat'));
    template.remove();
    return;
  }
  for (const item of items) {
    const fragment = template.content.cloneNode(true);
    const holder = document.createElement('div');
    holder.append(fragment);
    fill(holder, [typeof item === 'object' ? item : { value: item }, ...scopes], report);
    parent.insertBefore(holderToFragment(holder), template);
  }
  template.remove();
}

function holderToFragment(holder) {
  const fragment = document.createDocumentFragment();
  fragment.append(...holder.childNodes);
  return fragment;
}

// Attributes are removed once applied so an outer scope never re-processes a filled clone.
function apply(el, scopes, report) {
  const text = el.getAttribute('data-cv');
  if (text) set(el, scopes, text, report, (v) => { el.textContent = v; });
  const html = el.getAttribute('data-cv-html');
  if (html) set(el, scopes, html, report, (v) => { el.innerHTML = v; });
  const attrs = el.getAttribute('data-cv-attr');
  if (attrs) {
    for (const pair of attrs.split(';').map((p) => p.trim()).filter(Boolean)) {
      const [name, path] = pair.split(':').map((p) => p.trim());
      set(el, scopes, path, report, (v) => {
        if (v === '' || v == null) el.removeAttribute(name);
        else el.setAttribute(name, v);
      });
    }
  }
  for (const a of ['data-if', 'data-cv', 'data-cv-html', 'data-cv-attr']) el.removeAttribute(a);
}

function set(el, scopes, path, report, write) {
  const value = get(scopes, path);
  if (value === undefined) {
    report.unresolved.push(path);
    return;
  }
  write(Array.isArray(value) ? value.join(', ') : value);
}

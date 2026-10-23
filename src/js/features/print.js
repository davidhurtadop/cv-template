/** "JANE DOE" -> "Jane Doe"; names already written in mixed case are kept as they are. */
function displayName(name, lang) {
  if (name !== name.toLocaleUpperCase(lang)) return name;
  return name.toLocaleLowerCase(lang).replace(/(^|[\s'-])(\p{L})/gu, (m, sep, letter) => sep + letter.toLocaleUpperCase(lang));
}

/**
 * Renders the A4 print layout into a hidden #print-root. print.css shows only that element when
 * printing, so both the "Download PDF" button and Ctrl/Cmd+P produce the same document.
 */
export function initPrint({ html, vm, render, lang, layoutHref }) {
  const printRoot = document.createElement('div');
  printRoot.id = 'print-root';
  printRoot.hidden = true;
  printRoot.setAttribute('aria-hidden', 'true');
  printRoot.innerHTML = html;
  render(printRoot, vm);
  document.body.append(printRoot);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.media = 'print';
  link.href = layoutHref;
  document.head.append(link);

  // The browser proposes the document title as the PDF file name: "CV - Jane Doe (en)".
  const fileName = `CV - ${displayName(vm.name, lang)} (${lang})`;
  let previousTitle = document.title;
  window.addEventListener('beforeprint', () => { previousTitle = document.title; document.title = fileName; });
  window.addEventListener('afterprint', () => { document.title = previousTitle; });

  for (const button of document.querySelectorAll('[data-print-pdf]')) {
    button.addEventListener('click', () => window.print());
  }
}

// This parser is provided by Checkly runtime 2026.04; no browser is launched.
const { DOMParser: RuntimeDOMParser } = require('@xmldom/xmldom') as {
  DOMParser: new () => {
    parseFromString: (source: string, mimeType: 'text/html') => Document
  }
}

export function getKeywordPageText(html: string): string {
  const document = new RuntimeDOMParser().parseFromString(html, 'text/html')
  const body = document.getElementsByTagName('body').item(0)
  if (body == null) throw new Error('Expected an HTML document with a body')

  // Metadata, embedded JSON and inert markup cannot satisfy page content checks.
  for (const tag of ['script', 'style', 'template', 'noscript']) {
    for (const element of Array.from(body.getElementsByTagName(tag))) {
      element.parentNode?.removeChild(element)
    }
  }
  // React streams page content in hidden containers before inserting it into
  // the visible DOM. Keep that server content; the US browser checks rendering.

  return (body.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
}

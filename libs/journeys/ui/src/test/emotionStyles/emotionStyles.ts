/** Every Emotion stylesheet on the page as one string, for asserting rules jsdom's computed style ignores (`@media`, `:hover`). */
export function styleText(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => node.textContent ?? '')
    .join('')
}

/** An element's Emotion class name, escaped for use in a `RegExp` over `styleText()`. */
export function emotionClass(element: Element): string {
  const name = Array.from(element.classList).find((candidate) =>
    candidate.startsWith('css-')
  )
  if (name == null) throw new Error('no emotion class')
  return name.replace(/[-]/g, '\\-')
}

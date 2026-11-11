/**
 * The CSS Emotion generated for an element, flattened to one whitespace-free
 * string with each media rule's condition prefixed: jsdom's computed style
 * ignores `@media`, so responsive sx (`{ xs, md }`) is asserted from the
 * stylesheet instead, e.g. `@media(min-width:900px){display:block;}`.
 */
export function cssRulesFor(element: HTMLElement): string {
  const classes = Array.from(element.classList)
  const out: string[] = []
  const visit = (rule: CSSRule, prefix: string): void => {
    const nested = (rule as CSSMediaRule).cssRules
    const condition = (rule as CSSMediaRule).conditionText
    if (nested != null && condition != null) {
      Array.from(nested).forEach((child) =>
        visit(child, `${prefix}@media ${condition}{`)
      )
      return
    }
    const selector = (rule as CSSStyleRule).selectorText
    if (selector == null) return
    if (!classes.some((className) => selector.includes(`.${className}`))) return
    const body = (rule as CSSStyleRule).style.cssText
    const closing = '}'.repeat(prefix.split('{').length - 1)
    out.push(`${prefix}${body}${closing}`)
  }
  Array.from(document.styleSheets).forEach((sheet) =>
    Array.from(sheet.cssRules).forEach((rule) => visit(rule, ''))
  )
  return out.join('').replace(/\s+/g, '')
}

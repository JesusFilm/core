export function getBrowserDateFormat(): string {
  const fallback = 'dd-MM-yyyy'
  if (typeof window === 'undefined') return fallback

  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      calendar: 'gregory',
      numberingSystem: 'latn',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date(2026, 4, 4))
    const tokens = { year: 'yyyy', month: 'MM', day: 'dd' }
    const fields = parts.filter((part) => part.type !== 'literal')
    if (
      fields.length !== 3 ||
      !Object.keys(tokens).every(
        (type) => fields.filter((part) => part.type === type).length === 1
      )
    )
      return fallback

    return parts
      .map((part) => {
        if (part.type === 'literal') {
          // Quote date-fns token letters and apostrophes in literal separators.
          return part.value.replace(/'/g, "''").replace(/[a-zA-Z]+/g, "'$&'")
        }
        return tokens[part.type as keyof typeof tokens]
      })
      .join('')
  } catch {
    return fallback
  }
}

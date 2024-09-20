export function normalizeLanguage(language: string): string {
  return language.toLowerCase().split(',')[0].trim()
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function parseSuggestion(suggestion: string): string[] {
  return suggestion.split(/\s(?:in|and)\s/)
}

export function stripLanguageFromQuery(
  language: string,
  query: string
): string {
  const normalizedLanguage = normalizeLanguage(language)
  const hasLanguageInQuery = query.toLowerCase().includes(normalizedLanguage)
  if (hasLanguageInQuery) {
    const regEx = new RegExp(normalizedLanguage, 'ig')
    const strippedQuery = query.replace(regEx, '').trim()
    return strippedQuery
  }
  return query
}

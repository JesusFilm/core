export function normalizeLanguage(language: string): string {
  return language.toLowerCase().split(',')[0].trim()
}

export function normalizeLanguage(language: string): string {
  return language.toLowerCase().split(',')[0].trim()
}

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

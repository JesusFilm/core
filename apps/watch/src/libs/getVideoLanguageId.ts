import { languageSlugs } from './languageSlugs'

/**
 * Maps language slugs to their corresponding IDs.
 * This is a reverse mapping of the languageSlugs record, where:
 * - Keys are the slugs (e.g., 'english', 'spanish')
 * - Values are the language IDs (e.g., 'en', 'es')
 */
const slugToIdMap = Object.entries(languageSlugs).reduce<
  Record<string, string>
>((acc, [id, slug]) => {
  acc[slug] = id
  return acc
}, {})

/**
 * Gets the language ID for a given language slug.
 * @param slug - The language slug to look up (e.g., 'english', 'spanish')
 * @returns The corresponding language ID (e.g., 'en', 'es') or undefined if not found
 * @example
 * ```ts
 * const languageId = getVideoLanguageId('english') // returns 'en'
 * ```
 */
export const getVideoLanguageId = (
  slug: string | undefined | null
): string | undefined => {
  if (!slug) return undefined
  return slugToIdMap[slug]
}

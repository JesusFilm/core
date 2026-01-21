import { PrismaClient } from '.prisma/api-languages-client'

const languagesPrisma = new PrismaClient()

const languageIdToBcp47Cache = new Map<string, string | null>()

/**
 * Maps API Media languageId to Strapi locale code (bcp47)
 * @param languageId - The language ID from API Media
 * @returns The bcp47 locale code or null if not found
 */
export async function languageIdToLocale(
  languageId: string
): Promise<string | null> {
  if (languageIdToBcp47Cache.has(languageId)) {
    return languageIdToBcp47Cache.get(languageId) ?? null
  }

  try {
    const language = await languagesPrisma.language.findUnique({
      where: { id: languageId },
      select: { bcp47: true }
    })

    const bcp47 = language?.bcp47 ?? null
    languageIdToBcp47Cache.set(languageId, bcp47)

    return bcp47
  } catch (error) {
    console.error(`Error mapping languageId ${languageId} to locale:`, error)
    return null
  }
}

/**
 * Clears the language ID to locale cache
 */
export function clearLanguageMappingCache(): void {
  languageIdToBcp47Cache.clear()
}

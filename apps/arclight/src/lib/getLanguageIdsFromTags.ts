import { prisma as languagesPrisma } from '@core/prisma/languages/client'

import { generateCacheKey, getWithStaleCache } from './cache'

// Support legacy locale tags
const LANGUAGE_MAPPINGS = new Map<string, string>([
  ['en-US', 'en'],
  ['ko-KR', 'ko'],
  ['ar-SA', 'ar'],
  ['es-MX', 'es'],
  ['pt-BR', 'pt'],
  ['tr-TR', 'tr'],
  ['zh-Hans', 'zh-hans'],
  ['fa-IR', 'fa'],
  ['ur-PK', 'ur'],
  ['he-IL', 'he'],
  ['hi-IN', 'hi'],
  ['fr-FR', 'fr'],
  ['zh-Hant', 'zh-hant'],
  ['ru-RU', 'ru'],
  ['de-DE', 'de'],
  ['id-ID', 'id'],
  ['ja-JP', 'ja'],
  ['vi-VN', 'vi'],
  ['th-TH', 'th']
])

function matchLocales(metadataLanguageTag: string): string | undefined {
  const exactMatch = LANGUAGE_MAPPINGS.has(metadataLanguageTag)

  if (exactMatch) {
    return LANGUAGE_MAPPINGS.get(metadataLanguageTag)
  }

  return metadataLanguageTag.startsWith('en-') ? 'en' : undefined
}

async function fetchLanguageId(languageTag: string): Promise<string> {
  const cacheKey = generateCacheKey(['bcp47', languageTag])
  return await getWithStaleCache(cacheKey, async () => {
    const language = await languagesPrisma.language.findFirst({
      where: { bcp47: languageTag }
    })
    return language?.id ?? ''
  })
}

/**
 * @deprecated: use getLanguageDetailsFromTags instead
 */
export async function getLanguageIdsFromTags(
  metadataLanguageTags: string[]
): Promise<{ metadataLanguageId: string; fallbackLanguageId: string }> {
  const DEFAULT_LANGUAGE_ID = '529'
  let metadataLanguageId = DEFAULT_LANGUAGE_ID
  const fallbackLanguageId = DEFAULT_LANGUAGE_ID

  if (metadataLanguageTags.length === 0) {
    return {
      metadataLanguageId,
      fallbackLanguageId
    }
  }

  const metadataLanguageTag =
    matchLocales(metadataLanguageTags[0]) ?? metadataLanguageTags[0]

  metadataLanguageId = await fetchLanguageId(metadataLanguageTag)

  if (!metadataLanguageId) {
    metadataLanguageId = DEFAULT_LANGUAGE_ID
  }

  return { metadataLanguageId, fallbackLanguageId }
}

/**
 * Selects language records matching the provided BCP47 tags and returns their ids and tags in preference order.
 *
 * @param metadataLanguageTags - Preferred language tags (first is primary, second is optional). The first tag may be canonicalized before lookup.
 * @returns An array of objects with `id` and `bcp47` for found languages, ordered to match the preference of the input tags; returns an empty array if `metadataLanguageTags` is empty.
 */
export async function getLanguageDetailsFromTags(
  metadataLanguageTags: string[]
): Promise<Array<{ id: string; bcp47: string | null }>> {
  if (metadataLanguageTags.length === 0) {
    return []
  }

  const neededBcp47Tags = [
    matchLocales(metadataLanguageTags[0]) ?? metadataLanguageTags[0],
    metadataLanguageTags[1] ?? 'en'
  ].filter(Boolean)

  const languages = await languagesPrisma.language.findMany({
    where: {
      bcp47: { in: neededBcp47Tags }
    },
    select: {
      id: true,
      bcp47: true
    }
  })

  return languages.sort((a, b) => {
    const indexA = neededBcp47Tags.indexOf(a.bcp47 ?? '')
    const indexB = neededBcp47Tags.indexOf(b.bcp47 ?? '')
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}

type ContentItem = {
  value: string
  languageId: string
}

type LanguageDetail = {
  id: string
  bcp47: string | null
}

/**
 * Selects the best content string for a field based on preferred languages, falling back to other available languages.
 *
 * @param contentArray - Array of content items with their language ids.
 * @param metadataLanguages - Ordered language details where the first entry is the primary preference.
 * @returns The selected content and its language metadata: `value` is the text (empty if none), `languageId` is the source language id or `null`, and `bcp47` is the corresponding BCP-47 tag or `null`.
 */
export function getPreferredContent(
  contentArray: ContentItem[],
  metadataLanguages: LanguageDetail[]
): { value: string; languageId: string | null; bcp47: string | null } {
  if (!contentArray?.length) {
    return { value: '', languageId: null, bcp47: null }
  }

  const primaryLanguage = metadataLanguages[0]
  if (primaryLanguage) {
    const primaryContent = contentArray.find(
      (item) => item.languageId === primaryLanguage.id
    )
    if (primaryContent) {
      return {
        value: primaryContent.value,
        languageId: primaryContent.languageId,
        bcp47: primaryLanguage.bcp47
      }
    }
  }

  const fallbackContent = contentArray.find((item) =>
    metadataLanguages.some((lang) => lang.id === item.languageId)
  )

  const fallbackLang = metadataLanguages.find(
    (lang) => lang.id === fallbackContent?.languageId
  )

  return {
    value: fallbackContent?.value ?? '',
    languageId: fallbackContent?.languageId ?? null,
    bcp47: fallbackLang?.bcp47 ?? null
  }
}

/**
 * Selects item values in the preferred language, falling back to values from any other available metadata languages.
 *
 * @param itemArray - Array of content items to select values from
 * @param metadataLanguages - Language details ordered by preference; the first entry is treated as the primary language
 * @returns `string[]` of values matching the primary language if any exist, otherwise values whose `languageId` appears in `metadataLanguages`, or an empty array
 */
export function getPreferredItems(
  itemArray: ContentItem[],
  metadataLanguages: LanguageDetail[]
): string[] {
  if (!itemArray?.length) return []

  const primaryLanguage = metadataLanguages[0]
  if (primaryLanguage) {
    const primaryItems = itemArray
      .filter((item) => item.languageId === primaryLanguage.id)
      .map((item) => item.value)

    if (primaryItems.length > 0) return primaryItems
  }

  return itemArray
    .filter((item) =>
      metadataLanguages.some((lang) => lang.id === item.languageId)
    )
    .map((item) => item.value)
}

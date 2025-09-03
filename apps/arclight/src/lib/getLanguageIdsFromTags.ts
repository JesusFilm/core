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

function matchLocales(metadataLanguageTags: string[]): string | undefined {
  const exactMatch = metadataLanguageTags.find((tag) =>
    LANGUAGE_MAPPINGS.has(tag)
  )
  if (exactMatch) {
    return LANGUAGE_MAPPINGS.get(exactMatch)
  }

  return metadataLanguageTags.find((tag) => tag.startsWith('en-'))
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
    matchLocales(metadataLanguageTags) ?? metadataLanguageTags[0]

  metadataLanguageId = await fetchLanguageId(metadataLanguageTag)

  if (!metadataLanguageId) {
    metadataLanguageId = DEFAULT_LANGUAGE_ID
  }

  return { metadataLanguageId, fallbackLanguageId }
}

export async function getLanguageDetailsFromTags(
  metadataLanguageTags: string[]
): Promise<{
  metadataLanguageIds: string[]
  metadataLanguageDetails: Array<{
    languageId: string
    languageName: string
    languageTag: string
  }>
}> {
  if (metadataLanguageTags.length === 0) {
    return {
      metadataLanguageIds: [],
      metadataLanguageDetails: []
    }
  }

  const metadataLanguageTag = metadataLanguageTags[0]
  const metadataLanguage = await languagesPrisma.language.findFirst({
    where: { bcp47: metadataLanguageTag }
  })
  const metadataLanguageId = metadataLanguage?.id ?? null

  const fallbackLanguage = await languagesPrisma.language.findFirst({
    where: { bcp47: metadataLanguageTags[1] ?? 'en' }
  })
  const fallbackLanguageId = fallbackLanguage?.id ?? null

  const languageIds = [metadataLanguageId, fallbackLanguageId].filter(Boolean)
  const languageDetails = await languagesPrisma.language.findMany({
    where: {
      id: { in: languageIds }
    },
    select: {
      id: true,
      name: true,
      bcp47: true
    }
  })

  return {
    metadataLanguageIds: languageIds,
    metadataLanguageDetails: languageDetails.map((lang) => ({
      languageId: lang.id,
      languageName: lang.name,
      languageTag: lang.bcp47
    }))
  }
}

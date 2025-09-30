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
  return languages
}

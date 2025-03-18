import { ResultOf, graphql } from 'gql.tada'
import { HTTPException } from 'hono/http-exception'

import { getApolloClient } from './apolloClient'

const GET_LANGUAGE_ID_FROM_BCP47 = graphql(`
  query GetLanguageIdFromBCP47($bcp47: ID!) {
    language(id: $bcp47, idType: bcp47) {
      id
    }
  }
`)

interface LanguageIds {
  metadataLanguageId: string
  fallbackLanguageId: string
}

// Support legacy locale tags
const LANGUAGE_MAPPINGS = new Map<string, string>([
  ['en-US', 'en'],
  ['ko-KR', 'ko'],
  ['ar-SA', 'ar'],
  ['es-MX', 'es'],
  ['pt-BR', 'pt'],
  ['tr-TR', 'tr'],
  ['zh-Hans', 'zh-Hans'],
  ['fa-IR', 'fa'],
  ['ur-PK', 'ur'],
  ['he-IL', 'he'],
  ['hi-IN', 'hi'],
  ['fr-FR', 'fr'],
  ['zh-Hant', 'zh-Hant'],
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
  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
  >({
    query: GET_LANGUAGE_ID_FROM_BCP47,
    variables: { bcp47: languageTag }
  })

  return data.language?.id ?? ''
}

export async function getLanguageIdsFromTags(
  metadataLanguageTags: string[]
): Promise<LanguageIds | HTTPException> {
  const DEFAULT_LANGUAGE_ID = '529'

  if (metadataLanguageTags.length === 0) {
    return {
      metadataLanguageId: DEFAULT_LANGUAGE_ID,
      fallbackLanguageId: DEFAULT_LANGUAGE_ID
    }
  }

  const metadataLanguageTag = matchLocales(metadataLanguageTags)
  if (!metadataLanguageTag) {
    return new HTTPException(400, {
      message: JSON.stringify({
        message: `Could not find a suitable language tag from the provided tags: ${metadataLanguageTags.join(', ')}`,
        logref: 400
      })
    })
  }

  const metadataLanguageId = await fetchLanguageId(metadataLanguageTag)
  if (!metadataLanguageId) {
    return new HTTPException(400, {
      message: JSON.stringify({
        message: `Parameter "metadataLanguageTags" of value "${metadataLanguageTags.join(', ')}" violated a constraint "Not acceptable metadata language tag(s): ${metadataLanguageTags.join(', ')}"`,
        logref: 400
      })
    })
  }

  const fallbackLanguageId =
    metadataLanguageTags.length > 1
      ? await fetchLanguageId(metadataLanguageTag)
      : DEFAULT_LANGUAGE_ID

  return { metadataLanguageId, fallbackLanguageId }
}

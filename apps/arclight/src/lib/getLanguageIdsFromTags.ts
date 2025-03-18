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

export async function getLanguageIdsFromTags(
  metadataLanguageTags: string[]
): Promise<LanguageIds | HTTPException> {
  let metadataLanguageId = '529'
  let fallbackLanguageId = ''

  console.log(metadataLanguageTags)
  if (metadataLanguageTags.length > 0) {
    const metadataLanguageTag = matchLocales(metadataLanguageTags)
    console.log(metadataLanguageTag)

    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTag }
    })
    if (data.language == null) {
      const metadataTagsString = metadataLanguageTags.join(', ')
      return new HTTPException(400, {
        message: JSON.stringify({
          message: `Parameter "metadataLanguageTags" of value "${metadataTagsString}" violated a constraint "Not acceptable metadata language tag(s): ${metadataTagsString}"`,
          logref: 400
        })
      })
    }

    metadataLanguageId = data.language?.id
  }

  if (metadataLanguageTags.length > 1) {
    const fallbackLanguageTag = matchLocales(metadataLanguageTags)
    if (fallbackLanguageTag) {
      const { data } = await getApolloClient().query<
        ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
      >({
        query: GET_LANGUAGE_ID_FROM_BCP47,
        variables: { bcp47: fallbackLanguageTag }
      })
      fallbackLanguageId = data.language?.id ?? ''
    }
  }

  return { metadataLanguageId, fallbackLanguageId }
}

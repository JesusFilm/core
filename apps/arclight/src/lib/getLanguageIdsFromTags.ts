import { ResultOf, graphql } from 'gql.tada'
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

export async function getLanguageIdsFromTags(
  metadataLanguageTags: string[]
): Promise<LanguageIds | Response> {
  let metadataLanguageId = '529'
  let fallbackLanguageId = ''

  if (metadataLanguageTags.length > 0) {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[0] }
    })
    if (data.language == null) {
      const metadataTagsString = metadataLanguageTags.join(', ')
      return new Response(
        JSON.stringify({
          message: `Parameter "metadataLanguageTags" of value "${metadataTagsString}" violated a constraint "Not acceptable metadata language tag(s): ${metadataTagsString}"`,
          logref: 400
        }),
        { status: 400 }
      )
    }

    metadataLanguageId = data.language?.id
  }

  if (metadataLanguageTags.length > 1) {
    const { data } = await getApolloClient().query<
      ResultOf<typeof GET_LANGUAGE_ID_FROM_BCP47>
    >({
      query: GET_LANGUAGE_ID_FROM_BCP47,
      variables: { bcp47: metadataLanguageTags[1] }
    })
    fallbackLanguageId = data.language?.id ?? ''
  }

  return { metadataLanguageId, fallbackLanguageId }
}

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { graphql } from 'gql.tada'
import { Logger } from 'pino'

export const GET_LANGUAGE = graphql(`
  query GetLanguage($id: ID!, $languageId: ID!) {
    language(id: $id) {
      id
      name(languageId: $languageId) {
        value
      }
    }
  }
`)

export async function getLanguageName(
  apollo: ApolloClient<NormalizedCacheObject>,
  languageId: string,
  logger?: Logger
): Promise<string | null> {
  try {
    const { data } = await apollo.query({
      query: GET_LANGUAGE,
      variables: {
        id: languageId,
        languageId: '529'
      }
    })

    if (data?.language?.name?.[0]?.value) {
      return data.language.name[0].value
    } else {
      logger?.info(`Could not get source language name for ID ${languageId}`)
      return null
    }
  } catch (error) {
    logger?.error('Error fetching source language data:', error)
  }
  return null
}

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Logger } from 'pino'

import { graphql } from '../../../../lib/graphql/gatewayGraphql'

export const GET_LANGUAGES = graphql(`
  query getLanguages {
    languages {
      id
      bcp47
      name(languageId: "529", primary: true) {
        value
        primary
        language {
          id
        }
      }
    }
  }
`)

function createApolloClient(): ApolloClient<any> {
  if (!process.env.GATEWAY_URL) {
    throw new Error('GATEWAY_URL environment variable is required')
  }

  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'api-media',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache'
      },
      query: {
        fetchPolicy: 'no-cache'
      }
    }
  })
}

interface LanguageRecord {
  [key: string]: {
    english: string | undefined
    primary: string | undefined
    bcp47: string | undefined
  }
}

export async function getLanguages(logger?: Logger): Promise<LanguageRecord> {
  let apollo: ApolloClient<any> | null = null

  try {
    apollo = createApolloClient()

    const { data } = await apollo.query({
      query: GET_LANGUAGES,
      fetchPolicy: 'no-cache'
    })

    const languagesRecord: LanguageRecord = {}
    data.languages.forEach((language) => {
      languagesRecord[language.id] = {
        english: language.name.find(({ language }) => language.id === '529')
          ?.value,
        primary: language.name.find(({ primary }) => primary)?.value,
        bcp47: language.bcp47 ?? undefined
      }
    })

    return languagesRecord
  } catch (error) {
    logger?.error(error, 'unable to get languages from gateway')
    return {}
  } finally {
    // Clean up Apollo client resources
    if (apollo) {
      void apollo.clearStore()
      void apollo.cache.reset()
      void apollo.stop()
    }
  }
}

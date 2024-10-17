import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Logger } from 'pino'

import { graphql } from '../../../../lib/graphql/gatewayGraphql'

export const GET_LANGUAGE_SLUGS = graphql(`
  query GetLanguageSlugs {
    languages {
      id
      slug
    }
  }
`)

export const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  name: 'api-media',
  version: process.env.SERVICE_VERSION,
  headers: {
    'x-graphql-client-name': 'api-media',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

let languageSlugs: Record<string, string> = {}

export function setLanguageSlugs(
  languages: Array<{ id: string; slug: string | null }>
): void {
  languageSlugs = {}
  languages.forEach(({ id, slug }) => {
    if (slug != null) languageSlugs[id] = slug
  })
}

export function getLanguageSlugs(): Record<string, string> {
  return languageSlugs
}

export async function importLanguageSlugs(
  logger?: Logger
): Promise<() => void> {
  logger?.info('fetch language slugs from api-languages started')

  const { data } = await apollo.query({
    query: GET_LANGUAGE_SLUGS
  })

  setLanguageSlugs(data.languages)

  logger?.info('fetch language slugs from api-languages finished')

  return () => setLanguageSlugs([])
}

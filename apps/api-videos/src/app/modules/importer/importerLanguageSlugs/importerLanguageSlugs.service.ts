import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Injectable } from '@nestjs/common'
import { graphql } from 'gql.tada'

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
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

@Injectable()
export class ImporterLanguageSlugsService {
  slugs: Record<string, string> = {}

  async getLanguageSlugs(): Promise<void> {
    console.log('getting language slugs from api-languages')
    const { data } = await apollo.query({
      query: GET_LANGUAGE_SLUGS
    })

    for (const language of data.languages) {
      if (language.id != null && language.slug != null)
        this.slugs[language.id] = language.slug
    }
    console.log('finished getting language slugs from api-languages')
  }
}

import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    term
    iso3
    bcp47
    ids
    countryIds
    type
    subTypes
    contentTypes
    expand
    filter
*/

const GET_LANGUAGES = graphql(`
  query GetLanguagesWithTags($limit: Int, $offset: Int) {
    languages(limit: $limit, offset: $offset) {
      id
      iso3
      bcp47
      name {
        value
      }
    }
  }
`)

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10)
  const offset = (page - 1) * limit

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_LANGUAGES>
  >({
    query: GET_LANGUAGES,
    variables: {
      limit,
      offset
    }
  })

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries()),
    page: page.toString(),
    limit: limit.toString()
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const firstQueryString = new URLSearchParams({
    ...queryObject,
    page: '1'
  }).toString()
  // TODO: Needs new query in gql
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: '1192'
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()

  const mediaLanguages = data.languages.map((language) => ({
    languageId: language.id,
    iso3: language.iso3,
    bcp47: language.bcp47,
    // TODO: investigate
    counts: {},
    // TODO investigate
    audioPreview: {},
    // TODO implement
    primaryCountryId: '',
    name: language.name[0].value,
    nameNative: language.name[1].value,
    // TODO investigate
    metadataLanguageTag: '',
    _links: {
      self: {
        // TODO queerystring
        href: `/v2/media-languages/${language.id}`
      }
    }
  }))

  const response = {
    page,
    limit,
    // TODO implement
    pages: 1234,
    // TODO implement
    total: 1234,
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-languages?${queryString}`
      },
      first: {
        href: `http://api.arclight.org/v2/media-languages?${firstQueryString}`
      },
      last: {
        href: `http://api.arclight.org/v2/media-languages?${lastQueryString}`
      },
      next: {
        href: `http://api.arclight.org/v2/media-languages?${nextQueryString}`
      }
    },
    _embedded: {
      mediaLanguages
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

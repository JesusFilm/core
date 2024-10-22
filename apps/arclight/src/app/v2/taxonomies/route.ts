import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags: comma separated list of language tags use second tag as a backup
*/

const GET_TAXONOMIES = graphql(`
  query GetTaxonomies {
    taxonomies {
      category
      term
      name {
        label
        languageCode
      }
    }
  }
`)

export async function GET(request: NextRequest): Promise<Response> {
  const query = request.nextUrl.searchParams
  const metadataLanguageTags = query
    .get('metadataLanguageTags')
    ?.split(',') ?? ['en']

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_TAXONOMIES>
  >({
    query: GET_TAXONOMIES
  })

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  interface TaxonomyGroup {
    terms: Record<string, { label: string; metadataLanguageTag: string }>
    _links?: {
      self: { href: string }
      taxonomies: { href: string }
    }
  }

  const groupedTaxonomies: Record<string, TaxonomyGroup> = {}

  data.taxonomies.forEach((taxonomy) => {
    if (groupedTaxonomies[taxonomy.category] === undefined) {
      groupedTaxonomies[taxonomy.category] = { terms: {} }
    }

    let bestMatchingName = taxonomy.name[0]
    for (const tag of metadataLanguageTags) {
      const match = taxonomy.name.find((name) => name.languageCode === tag)
      if (match !== undefined) {
        bestMatchingName = match
        break
      }
    }

    groupedTaxonomies[taxonomy.category].terms[taxonomy.term] = {
      label: bestMatchingName.label,
      metadataLanguageTag: bestMatchingName.languageCode
    }
  })

  Object.keys(groupedTaxonomies).forEach((category) => {
    groupedTaxonomies[category]._links = {
      self: {
        href: `https://api.arclight.org/v2/taxonomies/${category}?${queryString}`
      },
      taxonomies: {
        href: `https://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  })

  const response = {
    _links: {
      self: {
        href: `https://api.arclight.org/v2/taxonomies?${queryString}`
      }
    },
    _embedded: {
      taxonomies: groupedTaxonomies
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

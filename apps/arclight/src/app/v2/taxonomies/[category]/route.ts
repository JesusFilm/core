import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags
*/

const GET_TAXONOMY = graphql(`
  query GetTaxonomy($category: String!) {
    taxonomies(where: { category: $category }) {
      term
      name {
        label
        languageCode
      }
    }
  }
`)

interface TaxonomyParams {
  params: {
    category: string
  }
}

export async function GET(
  req: NextRequest,
  { params: { category } }: TaxonomyParams
): Promise<Response> {
  const query = req.nextUrl.searchParams
  const metadataLanguageTags = query
    .get('metadataLanguageTags')
    ?.split(',') ?? ['en']

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  const { data } = await getApolloClient().query<ResultOf<typeof GET_TAXONOMY>>(
    {
      query: GET_TAXONOMY,
      variables: {
        category
      }
    }
  )

  const terms: Record<string, { label: string; metadataLanguageTag: string }> =
    {}

  data.taxonomies.forEach((taxonomy) => {
    let bestMatchingName = taxonomy.name[0]
    for (const tag of metadataLanguageTags) {
      const match = taxonomy.name.find((name) => name.languageCode === tag)
      if (match !== undefined) {
        bestMatchingName = match
        break
      }
    }

    terms[taxonomy.term] = {
      label: bestMatchingName.label,
      metadataLanguageTag: bestMatchingName.languageCode
    }
  })

  const response = {
    terms,
    _links: {
      self: {
        href: `https://api.arclight.org/v2/taxonomies/${category}?${queryString}`
      },
      taxonomies: {
        href: `https://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

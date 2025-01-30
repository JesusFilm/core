import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { TaxonomyGroup, findBestMatchingName } from '../lib'

const GET_TAXONOMY = graphql(`
  query GetTaxonomy($category: String!, $languageCodes: [String!]) {
    taxonomies(category: $category) {
      category
      term
      name(languageCodes: $languageCodes) {
        label
        language {
          bcp47
        }
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
  const apiKey = query.get('apiKey') ?? ''

  const { data } = await getApolloClient().query<ResultOf<typeof GET_TAXONOMY>>(
    {
      query: GET_TAXONOMY,
      variables: {
        category,
        languageCodes: metadataLanguageTags
      }
    }
  )

  if (data.taxonomies.length === 0) {
    return new Response(
      JSON.stringify({
        message: `Taxonomy '${category}' not found!`,
        logref: 404
      }),
      { status: 404 }
    )
  }

  const response = {
    terms: {} as Record<string, { label: string; metadataLanguageTag: string }>,
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/${category}?apiKey=${apiKey}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?apiKey=${apiKey}`
      }
    }
  }

  data.taxonomies.forEach((taxonomy) => {
    if (taxonomy.name.length === 0) return

    const matchingName = findBestMatchingName(
      taxonomy.name as Array<{ label: string; language: { bcp47: string } }>,
      metadataLanguageTags
    )

    response.terms[taxonomy.term] = {
      label: matchingName.label,
      metadataLanguageTag: matchingName.language.bcp47
    }
  })

  return new Response(JSON.stringify(response), { status: 200 })
}

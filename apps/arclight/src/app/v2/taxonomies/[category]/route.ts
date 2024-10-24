import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'
import { paramsToRecord } from '../../../../lib/paramsToRecord'
import { TaxonomyGroup, findBestMatchingName } from '../lib'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags
*/

const GET_TAXONOMY = graphql(`
  query GetTaxonomy($category: String!, $languageCodes: [String!]) {
    taxonomies(category: $category) {
      category
      term
      name(languageCodes: $languageCodes) {
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
        category,
        languageCodes: metadataLanguageTags
      }
    }
  )

  const groupedTaxonomies: Record<string, TaxonomyGroup> = {}

  data.taxonomies.forEach((taxonomy) => {
    if (taxonomy.name.length === 0) {
      console.log('taxonomy.name is null')
      console.log('taxonomy', taxonomy)
      return
    }
    const matchingName = findBestMatchingName(
      taxonomy.name,
      metadataLanguageTags
    )
    if (groupedTaxonomies[taxonomy.category] === undefined) {
      groupedTaxonomies[taxonomy.category] = {
        terms: {
          [taxonomy.term]: {
            label: matchingName.label,
            metadataLanguageTag: matchingName.languageCode
          }
        },
        _links: {
          self: {
            href: `https://api.arclight.org/v2/taxonomies/${taxonomy.category}?${queryString}`
          },
          taxonomies: {
            href: `https://api.arclight.org/v2/taxonomies?${queryString}`
          }
        }
      }
    } else {
      // const

      groupedTaxonomies[taxonomy.category].terms[taxonomy.term] = {
        label: matchingName.label,
        metadataLanguageTag: matchingName.languageCode
      }
    }
  })

  if (Object.keys(groupedTaxonomies).length === 0) {
    return new Response(
      JSON.stringify({
        message: `Taxonomy '${category}' not found!`,
        logref: 404
      }),
      { status: 404 }
    )
  }

  const response = {
    _links: {
      self: { href: `http://api.arclight.org/v2/taxonomies?${queryString}` }
    },
    _embedded: { taxonomies: groupedTaxonomies }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

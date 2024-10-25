import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'

import { TaxonomyGroup, findBestMatchingName } from './lib'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags: comma separated list of language tags use second tag as a backup
*/

const GET_TAXONOMIES = graphql(`
  query GetTaxonomies($languageCodes: [String!]) {
    taxonomies {
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

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl
  const metadataLanguageTags = searchParams
    .get('metadataLanguageTags')
    ?.split(',') ?? ['en']
  const queryString = searchParams.toString()

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_TAXONOMIES>
  >({
    query: GET_TAXONOMIES,
    variables: { languageCodes: metadataLanguageTags }
  })

  const groupedTaxonomies: Record<string, TaxonomyGroup> = {}

  const filteredTaxonomies = data.taxonomies.filter(
    (taxonomy) => taxonomy.name.length > 0
  )

  if (filteredTaxonomies.length === 0) {
    return new Response(
      JSON.stringify({
        message: `Not acceptable metadata language tag(s): ${metadataLanguageTags.join(
          ', '
        )}`
      }),
      { status: 406 }
    )
  }

  filteredTaxonomies.forEach((taxonomy) => {
    const matchingName = findBestMatchingName(
      taxonomy.name as Array<{ label: string; language: { bcp47: string } }>,
      metadataLanguageTags
    )

    if (groupedTaxonomies[taxonomy.category] === undefined) {
      groupedTaxonomies[taxonomy.category] = {
        terms: {
          [taxonomy.term]: {
            label: matchingName.label,
            metadataLanguageTag: matchingName.language.bcp47
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
      groupedTaxonomies[taxonomy.category].terms[taxonomy.term] = {
        label: matchingName.label,
        metadataLanguageTag: matchingName.language.bcp47
      }
    }
  })

  const response = {
    _links: {
      self: { href: `http://api.arclight.org/v2/taxonomies?${queryString}` }
    },
    _embedded: { taxonomies: groupedTaxonomies }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

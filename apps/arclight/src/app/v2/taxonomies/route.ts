import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'

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
        languageCode
      }
    }
  }
`)

interface TaxonomyGroup {
  terms: Record<
    string,
    {
      label: string
      metadataLanguageTag: string
    }
  >
  _links: {
    self: { href: string }
    taxonomies: { href: string }
  }
}

const findBestMatchingName = (
  names: Array<{ label: string; languageCode: string }>,
  preferredLanguages: string[]
): { label: string; languageCode: string } => {
  console.log('INSIDE findBestMatchingName')
  console.log('names', names)
  console.log('preferredLanguages', preferredLanguages)

  for (const preferredLanguage of preferredLanguages) {
    const match = names.find((name) => name.languageCode === preferredLanguage)
    if (match !== undefined) return match
  }
  return names[0]
}

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

  const response = {
    _links: {
      self: { href: `http://api.arclight.org/v2/taxonomies?${queryString}` }
    },
    _embedded: { taxonomies: groupedTaxonomies }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

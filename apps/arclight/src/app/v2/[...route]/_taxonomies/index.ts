import { ResultOf, graphql } from 'gql.tada'
import { Hono } from 'hono'

import { getApolloClient } from '../../../../lib/apolloClient'

import { taxonomiesWithCategory } from './[category]'
import { TaxonomyGroup, findBestMatchingName } from './lib'

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

export const taxonomies = new Hono()
taxonomies.route('/:category', taxonomiesWithCategory)

taxonomies.get('/', async (c) => {
  const metadataLanguageTags = c.req
    .query('metadataLanguageTags')
    ?.split(',') ?? ['en']
  const apiKey = c.req.query('apiKey') ?? ''

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
            href: `http://api.arclight.org/v2/taxonomies/${taxonomy.category}?apiKey=${apiKey}`
          },
          taxonomies: {
            href: `http://api.arclight.org/v2/taxonomies?apiKey=${apiKey}`
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
      self: { href: `http://api.arclight.org/v2/taxonomies?apiKey=${apiKey}` }
    },
    _embedded: { taxonomies: groupedTaxonomies }
  }

  return c.json(response)
})

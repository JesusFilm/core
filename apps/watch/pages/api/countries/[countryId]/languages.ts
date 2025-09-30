import type { NextApiRequest, NextApiResponse } from 'next'

import { graphql } from '@core/shared/gql'

import { createApolloClient } from '../../../../src/libs/apolloClient'

interface CountryLanguageResponse {
  countryId: string
  countryName?: string
  languages: Array<{
    id: string
    slug?: string
    languageName: string
    englishName?: string
    nativeName?: string
  }>
}

type ApiResponse = CountryLanguageResponse | { error: string }

const GET_COUNTRY_LANGUAGES = graphql(`
  query GetCountryLanguages($countryId: ID!) {
    country(id: $countryId) {
      id
      name(primary: true) {
        value
      }
      countryLanguages {
        language {
          id
          slug
          englishName: name(languageId: "529") {
            value
          }
          nativeName: name(primary: true) {
            value
          }
        }
      }
    }
  }
`)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const countryIdParam = req.query.countryId

  const countryId = Array.isArray(countryIdParam)
    ? countryIdParam[0]
    : countryIdParam

  if (countryId == null || countryId.trim() === '') {
    res.status(400).json({ error: 'Country ID is required' })
    return
  }

  try {
    const apolloClient = createApolloClient()
    const { data } = await apolloClient.query({
      query: GET_COUNTRY_LANGUAGES,
      variables: { countryId }
    })

    const country = data.country

    if (country == null) {
      res.status(404).json({ error: 'Country not found' })
      return
    }

    const response: CountryLanguageResponse = {
      countryId: country.id,
      countryName: country.name[0]?.value ?? undefined,
      languages: country.countryLanguages
        .map(({ language }) => {
          const englishName = language.englishName.find(
            ({ value }) => value != null && value !== ''
          )?.value
          const nativeName = language.nativeName.find(
            ({ value }) => value != null && value !== ''
          )?.value

          const languageName = englishName ?? nativeName ?? language.id

          return {
            id: language.id,
            slug: language.slug ?? undefined,
            languageName,
            englishName: englishName ?? undefined,
            nativeName: nativeName ?? undefined
          }
        })
        .sort((a, b) => a.languageName.localeCompare(b.languageName))
    }

    res.setHeader(
      'Cache-Control',
      'public, max-age=900, stale-while-revalidate=900'
    )
    res.status(200).json(response)
  } catch (error) {
    console.error('Failed to fetch country languages:', error)
    res.status(500).json({ error: 'Failed to fetch country languages' })
  }
}


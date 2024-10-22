import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
*/

const GET_LANGUAGES = graphql(`
  query GetLanguages($languageIds: [ID!]) {
    languages(where: { ids: $languageIds }) {
      id
      bcp47
      name(languageId: 529, primary: true) {
        value
      }
    }
  }
`)

export async function GET(req: NextRequest): Promise<Response> {
  const query = req.nextUrl.searchParams

  const apiKey = query.get('apiKey') ?? ''

  const { data } = await getApolloClient().query<
    ResultOf<typeof GET_LANGUAGES>
  >({
    query: GET_LANGUAGES,
    variables: {
      languageIds: [
        '407',
        '496',
        '529',
        '584',
        '1106',
        '1942',
        '3804',
        '3887',
        '3934',
        '6464',
        '6788',
        '6930',
        '7083',
        '13169',
        '16639',
        '21028',
        '21753',
        '21754',
        '22658'
      ]
    }
  })

  const languages = data.languages
    .map((language) => ({
      tag: language.bcp47 ?? '',
      name: language.name[1]?.value ?? language.name[0].value,
      nativeName: language.name[0].value,
      _links: {
        self: {
          href: `https://api.arclight.com/v2/metadata-language-tags/${language.bcp47}?apiKey=${apiKey}`
        },
        metadataLanguageTags: {
          href: `https://api.arclight.com/v2/metadata-language-tags/?apiKey=${apiKey}`
        }
      }
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag)) // Sort alphabetically by tag

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `https://api.arclight.com/v2/media-languages/${queryString}`
      }
    },
    _embedded: {
      metadataLanguageTags: languages
    }
  }

  return new Response(JSON.stringify(response), { status: 200 })
}

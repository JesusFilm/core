import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../lib/apolloClient'
import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  querystring:
    apiKey
*/

const GET_LANGUAGES = graphql(`
  query GetLanguages {
    languages {
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
    query: GET_LANGUAGES
  })

  const languages = data.languages.map((language) => ({
    tag: language.bcp47,
    name: language.name[0].value,
    nativeName: language.name[1]?.value ?? language.name[0].value,
    _links: {
      // TODO: handle querystring
      self: {
        href: `https://api.arclight.com/v2/metadata-language-tags/${language.bcp47}?apiKey=${apiKey}`
      },
      // TODO: handle querystring
      metadataLanguageTags: {
        href: `https://api.arclight.com/v2/metadata-language-tags/?apiKey=${apiKey}`
      }
    }
  }))

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

import { ResultOf, graphql } from 'gql.tada'
import { NextRequest } from 'next/server'

import { getApolloClient } from '../../../../lib/apolloClient'

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

interface GetParams {
  params: { metadataLanguageTag: string }
}

export async function GET(req: NextRequest, { params }: GetParams): Promise<Response> {
  const query = req.nextUrl.searchParams
  const { metadataLanguageTag } = params

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

  const language = data.languages.find(lang => lang.bcp47 === metadataLanguageTag)
  
  if (language === null || language === undefined) {
    return new Response(JSON.stringify({
      message: `Metadata language tag '${metadataLanguageTag}' not found!`,
      logref: 404
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const response = [{
    tag: language?.bcp47 ?? '',
    name: language?.name[1]?.value ?? language?.name[0].value,
    nameNative: language?.name[0].value,
    _links: {
      self: {
        href: `https://api.arclight.org/v2/metadata-language-tags/${language.bcp47}?apiKey=${apiKey}`
      },
      metadataLanguageTags: {
        href: `https://api.arclight.org/v2/metadata-language-tags?apiKey=${apiKey}`
      }
    }
  }]

  return new Response(JSON.stringify(response), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

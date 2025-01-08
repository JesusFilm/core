import { NextRequest } from 'next/server'

import { languages } from '../languages'

interface GetParams {
  params: { metadataLanguageTag: string }
}

export async function GET(
  req: NextRequest,
  { params }: GetParams
): Promise<Response> {
  const query = req.nextUrl.searchParams
  const { metadataLanguageTag } = params
  const apiKey = query.get('apiKey') ?? ''

  const language = languages.find((lang) => lang.tag === metadataLanguageTag)

  if (!language) {
    return new Response(
      JSON.stringify({
        message: `Metadata language tag '${metadataLanguageTag}' not found!`,
        logref: 404
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  const response = [
    {
      tag: language.tag,
      name: language.name,
      nameNative: language.nameNative,
      _links: {
        self: {
          href: `http://api.arclight.org/v2/metadata-language-tags/${language.tag}?apiKey=${apiKey}`
        },
        metadataLanguageTags: {
          href: `http://api.arclight.org/v2/metadata-language-tags?apiKey=${apiKey}`
        }
      }
    }
  ]

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

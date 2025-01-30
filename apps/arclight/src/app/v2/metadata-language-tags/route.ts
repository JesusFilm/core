import { NextRequest } from 'next/server'

import { paramsToRecord } from '../../../lib/paramsToRecord'

import { languages } from './languages'

export async function GET(req: NextRequest): Promise<Response> {
  const query = req.nextUrl.searchParams
  const apiKey = query.get('apiKey') ?? ''

  const languagesList = languages
    .map((language) => ({
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
    }))
    .sort((a, b) => a.tag.localeCompare(b.tag))

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `http://api.arclight.org/v2/media-languages/${queryString}`
      }
    },
    _embedded: {
      metadataLanguageTags: languagesList
    }
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

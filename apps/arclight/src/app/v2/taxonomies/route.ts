import { NextRequest } from 'next/server'

import { paramsToRecord } from '../../../lib/paramsToRecord'

import { contentTypes, genres, osisBibleBooks, subTypes, types } from './fields'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags
*/

export async function GET(req: NextRequest): Promise<Response> {
  const query = req.nextUrl.searchParams
  const metadataLanguageTags = query.get('metadataLanguageTags') ?? 'en'

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const response = {
    _links: {
      self: {
        href: `https://api.arclight.com/v2/taxonomies${queryString}`
      }
    },
    _embedded: {
      taxonomies: {
        // TODO: handle translations
        contentTypes: await contentTypes(metadataLanguageTags, queryString),
        // TODO: investigate
        genres: await genres(metadataLanguageTags, queryString),
        // TODO: investigate
        osisBibleBooks: await osisBibleBooks(metadataLanguageTags, queryString),
        // TODO: handle translations
        subTypes: await subTypes(metadataLanguageTags, queryString),
        // TODO: handle translations
        types: await types(metadataLanguageTags, queryString)
      }
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}

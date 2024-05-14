import { NextRequest } from 'next/server'

import { paramsToRecord } from '../../../../lib/paramsToRecord'
import {
  contentTypes,
  genres,
  osisBibleBooks,
  subTypes,
  types
} from '../fields'

/* TODO: 
  querystring:
    apiKey
    metadataLanguageTags
*/

interface TaxonomyParams {
  params: {
    taxonomyId: string
  }
}

export async function GET(
  req: NextRequest,
  { params: { taxonomyId } }: TaxonomyParams
): Promise<Response> {
  const query = req.nextUrl.searchParams
  const metadataLanguageTags = query.get('metadataLanguageTags') ?? 'en'

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }

  const queryString = new URLSearchParams(queryObject).toString()

  let taxonomy = {}
  switch (taxonomyId) {
    case 'contentTypes':
      taxonomy = await contentTypes(metadataLanguageTags, queryString)
      break
    case 'genres':
      taxonomy = await genres(metadataLanguageTags, queryString)
      break
    case 'osisBibleBooks':
      taxonomy = await osisBibleBooks(metadataLanguageTags, queryString)
      break
    case 'subTypes':
      taxonomy = await subTypes(metadataLanguageTags, queryString)
      break
    case 'types':
      taxonomy = await types(metadataLanguageTags, queryString)
      break
  }
  const response = {
    ...taxonomy,
    _links: {
      self: {
        href: `http://api.arclight.org/v2/taxonomies/${taxonomyId}?${queryString}`
      },
      taxonomies: {
        href: `http://api.arclight.org/v2/taxonomies?${queryString}`
      }
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}

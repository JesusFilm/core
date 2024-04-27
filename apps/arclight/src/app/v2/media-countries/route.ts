import { NextRequest } from 'next/server'

import { paramsToRecord } from '../../../lib/paramsToRecord'

/* TODO: 
  api-countries needs to be rebuilt
  querystring:
    apiKey
    term
    ids
    languageIds
    expand
    filter
    metadataLanguageTags
*/

export async function GET(req: NextRequest): Promise<Response> {
  const query = req.nextUrl.searchParams

  const page = Number(query.get('page') ?? 1)
  const limit = Number(query.get('limit') ?? 10)
  // const offset = (page - 1) * limit

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries()),
    page: page.toString(),
    limit: limit.toString()
  }

  const queryString = new URLSearchParams(queryObject).toString()
  const firstQueryString = new URLSearchParams({
    ...queryObject,
    page: '1'
  }).toString()
  const lastQueryString = new URLSearchParams({
    ...queryObject,
    page: '1234'
  }).toString()
  const nextQueryString = new URLSearchParams({
    ...queryObject,
    page: (page + 1).toString()
  }).toString()

  const response = {
    page,
    limit,
    // TODO: Needs to be completed
    pages: 1234,
    // TODO: Needs to be completed
    total: 1234,
    _embedded: {
      // TODO implement api countries again
      mediaCountries: []
    },
    _links: {
      self: {
        href: `https://api.arclight.com/v2/mediaComponents?${queryString}`
      },
      first: {
        href: `https://api.arclight.com/v2/mediaComponents?${firstQueryString}`
      },
      last: {
        href: `https://api.arclight.com/v2/mediaComponents?${lastQueryString}`
      },
      next: {
        href: `https://api.arclight.com/v2/mediaComponents?${nextQueryString}`
      }
    }
  }
  return new Response(JSON.stringify(response), { status: 200 })
}

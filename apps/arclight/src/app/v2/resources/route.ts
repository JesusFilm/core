import { NextRequest } from 'next/server'

import { paramsToRecord } from '../../../lib/paramsToRecord'

export async function GET(req: NextRequest): Promise<Response> {
  const query = req.nextUrl.searchParams

  const queryObject: Record<string, string> = {
    ...paramsToRecord(query.entries())
  }
  const queryString = new URLSearchParams(queryObject).toString()

  const response = {}
  return new Response(JSON.stringify(response), { status: 200 })
}

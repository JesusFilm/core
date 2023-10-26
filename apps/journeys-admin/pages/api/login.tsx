import { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'

import { setAuthCookies } from '../../src/libs/setAuthCookies'

export const config = {
  runtime: 'edge'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<NextResponse> {
  try {
    await setAuthCookies(req, res, {})
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

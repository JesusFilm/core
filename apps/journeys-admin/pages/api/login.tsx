import { NextApiRequest, NextApiResponse } from 'next'

import { setAuthCookies } from '../../src/libs/setAuthCookies'

export const config = {
  runtime: 'edge'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    await setAuthCookies(req, res, {})
    res.status(200).json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Unexpected error.' })
  }
}

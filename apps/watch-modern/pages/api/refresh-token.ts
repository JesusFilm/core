import type { NextApiRequest, NextApiResponse } from 'next'
import { setAuthCookies } from 'next-firebase-auth'

import { initAuth } from '../../src/libs/auth/initAuth'

initAuth()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    await setAuthCookies(req, res, {})
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to refresh auth cookies.', error)
    res.status(500).json({ error: 'Unable to refresh authentication token.' })
  }
}

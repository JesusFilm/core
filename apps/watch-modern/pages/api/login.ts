import type { NextApiRequest, NextApiResponse } from 'next'
import { setAuthCookies } from 'next-firebase-auth'

import { initAuth } from '../../src/libs/auth/initAuth'

initAuth()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  try {
    await setAuthCookies(req, res, {})
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to set auth cookies during login.', error)
    res.status(500).json({ error: 'Unexpected authentication error.' })
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { unsetAuthCookies } from 'next-firebase-auth'

import { initAuth } from '../../src/libs/auth/initAuth'

initAuth()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    await unsetAuthCookies(req, res)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to clear auth cookies during logout.', error)
    res.status(500).json({ error: 'Unexpected logout error.' })
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
// import { setAuthCookies } from 'next-firebase-auth'
// import { getFirebaseAuth } from 'next-firebase-auth-edge/lib/auth'

// import { initAuth } from '../../src/libs/firebaseClient/initAuth'
// import { getFirebasePrivateKey } from '@core/shared/ui/getFirebasePrivateKey'

import { setAuthCookies } from '../../src/libs/setAuthCookies'

// initAuth()

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

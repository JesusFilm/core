import Cors from 'cors'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyIdToken } from 'next-firebase-auth'

import { initAuth } from '../../src/libs/firebaseClient/initAuth'

initAuth()
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD']
})

// cors example taken from: https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: typeof cors
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Run the middleware
  await runMiddleware(req, res, cors)

  if (req.cookies['journeys-admin.AuthUser'] == null)
    return res.status(400).json({ error: 'Missing Authorization header value' })
  const token = req.cookies['journeys-admin.AuthUser']
  try {
    await verifyIdToken(token)
  } catch (e) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  try {
    await res.revalidate(`/journeys/${req.query.journeyId as string}`)
    return res.status(200).json({ revalidated: true })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating journeys admin')
  }
}

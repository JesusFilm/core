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

  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  if (req.cookies['journeys-admin.AuthUser'] == null)
    return res.status(400).json({ error: 'Missing Authorization header value' })

  if (
    process.env.JOURNEYS_URL == null ||
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null
  )
    return res.status(500).json({ error: 'Missing Environment Variables' })
  const token = req.cookies['journeys-admin.AuthUser']

  try {
    await verifyIdToken(token)
  } catch (e) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const slug = req.query.slug?.toString()
  const hostname = req?.query?.hostname?.toString()

  if (slug == null) return res.status(400).json({ error: 'Missing Slug' })

  const params: { accessToken: string; slug: string; hostname?: string } = {
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    slug
  }

  if (hostname != null) params.hostname = hostname

  try {
    const response = await fetch(
      `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(
        params
      ).toString()}`
    )

    const responseData = await response.json()

    return res.status(response.status).json({
      ...responseData
    })
  } catch (e) {
    return res.status(500).json({
      error: 'Error revalidating'
    })
  }
}

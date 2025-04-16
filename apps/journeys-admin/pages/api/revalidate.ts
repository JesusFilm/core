import Cors from 'cors'
import FormData from 'form-data'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyIdToken } from 'next-firebase-auth'
import fetch from 'node-fetch'

import { initAuth } from '../../src/libs/firebaseClient/initAuth'

initAuth()
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD']
})

async function sleep(ms: number | undefined): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function generateFacebookAppAccessToken(): Promise<string> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Facebook App ID or App Secret not configured')
  }

  const response = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
  )

  if (!response.ok) {
    throw new Error(`Failed to generate access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
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
  const path = `/${hostname ?? 'home'}/${req.query.slug as string}`

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

    // 300ms required to invalidate edge caches
    await sleep(300)

    const responseData = await response.json()

    // Skip Facebook re-scrape in development environment
    if (process.env.NODE_ENV === 'development')
      return res.status(200).json({
        ...responseData,
        environment: 'development',
        message: 'Facebook re-scrape skipped in development'
      })

    // Trigger Facebook re-scrape for staging and production
    const journeyUrl =
      hostname != null
        ? `https://${hostname}${path}`
        : `${process.env.JOURNEYS_URL}${path}`

    try {
      const fbAccessToken = await generateFacebookAppAccessToken()
      const formData = new FormData()
      formData.append('id', journeyUrl)
      formData.append('scrape', 'true')

      await fetch(
        `https://graph.facebook.com/v19.0/?access_token=${fbAccessToken}`,
        {
          method: 'POST',
          body: formData
        }
      )

      return res.status(response.status).json({
        ...responseData,
        facebookScrape: true
      })
    } catch (fbError) {
      return res.status(response.status).json({
        ...responseData,
        facebookError: {
          message: fbError.message,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (e) {
    return res.status(500).json({
      error: 'Error revalidating'
    })
  }
}

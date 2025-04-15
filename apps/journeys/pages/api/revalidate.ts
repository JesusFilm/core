import FormData from 'form-data'
import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

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
  // Check for accessToken to confirm this is a valid request
  if (
    req.query.accessToken == null ||
    req.query.accessToken !== process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  ) {
    return res.status(401).json({ message: 'Invalid access token' })
  }

  try {
    const hostname = req.query.hostname?.toString()
    const path = `/${hostname ?? 'home'}/${req.query.slug as string}`
    await res.revalidate(path)

    // Skip Facebook re-scrape in development environment
    if (process.env.NODE_ENV === 'development')
      return res.status(200).json({
        revalidated: true,
        environment: 'development',
        message: 'Facebook re-scrape skipped in development'
      })

    // Trigger Facebook re-scrape for staging and production
    const journeyUrl =
      hostname != null
        ? `https://${hostname}${path}`
        : `${process.env.NEXT_PUBLIC_JOURNEYS_URL}${path}`

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
    } catch (fbError) {
      return res.status(503).json({
        revalidated: true,
        facebookError: {
          message: fbError.message,
          timestamp: new Date().toISOString()
        }
      })
    }

    return res.status(200).json({
      revalidated: true
    })
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({
      error: 'Error revalidating'
    })
  }
}

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

    // Trigger Facebook re-scrape
    const journeyUrl =
      hostname != null
        ? `https://${hostname}${path}`
        : `${process.env.NEXT_PUBLIC_JOURNEYS_URL}${path}`

    try {
      const fbAccessToken = await generateFacebookAppAccessToken()
      await fetch(
        `https://graph.facebook.com/v22.0/?access_token=${fbAccessToken}`,
        {
          method: 'POST',
          body: new URLSearchParams({
            id: journeyUrl,
            scrape: 'true'
          })
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

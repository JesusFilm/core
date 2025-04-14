import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

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
      await fetch('https://graph.facebook.com', {
        method: 'POST',
        body: new URLSearchParams({
          id: journeyUrl,
          scrape: 'true'
        })
      })
    } catch (fbError) {
      // Don't fail the whole request if Facebook scrape fails
      return res.status(200).json({
        revalidated: true,
        facebookError: fbError
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

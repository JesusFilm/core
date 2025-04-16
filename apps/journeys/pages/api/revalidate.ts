import type { NextApiRequest, NextApiResponse } from 'next'

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

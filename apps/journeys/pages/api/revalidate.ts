import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Resolve the Next.js page path to revalidate. The revalidate worker's
 * `paths[]` job sends an explicit `path` (campaign pages are not addressed
 * by a journey slug); the journey job sends `slug` and optionally `hostname`.
 */
function resolvePath(query: NextApiRequest['query']): string | null {
  const path = query.path?.toString()
  if (path != null) return path.startsWith('/') ? path : null
  const slug = query.slug?.toString()
  if (slug == null) return null
  const hostname = query.hostname?.toString()
  return `/${hostname ?? 'home'}/${slug}`
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

  const path = resolvePath(req.query)
  if (path == null) {
    return res.status(400).json({ message: 'Missing path or slug' })
  }

  try {
    await res.revalidate(path)

    return res.status(200).json({
      revalidated: true
    })
  } catch {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({
      error: 'Error revalidating'
    })
  }
}

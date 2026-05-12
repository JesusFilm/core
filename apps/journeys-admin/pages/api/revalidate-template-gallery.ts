import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import fetch from 'node-fetch'

import { authConfig } from '../../src/libs/auth/config'

// Authenticated proxy that asks the public journeys app to revalidate a
// template-gallery page. Fire-and-forget from the admin client after a
// mutation succeeds (save, publish, unpublish, assign, reorder, delete).
//
// Unlike `preview-template-gallery.ts`, this endpoint does NOT redirect —
// the caller stays on the admin page. The 300ms edge-cache sleep that the
// preview proxy used is also unnecessary here: we are not about to load the
// public URL in this same flow.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (
    process.env.JOURNEYS_URL == null ||
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null
  )
    return res.status(500).json({ error: 'Missing Environment Variables' })

  try {
    const tokens = await getApiRequestTokens(req, authConfig)
    if (tokens == null) {
      return res.status(403).json({ error: 'Not authorized' })
    }
  } catch (e) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const slug = req.query.slug?.toString()
  if (slug == null) return res.status(400).json({ error: 'Missing Slug' })

  const params = new URLSearchParams({
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    slug
  })

  try {
    const response = await fetch(
      `${
        process.env.JOURNEYS_URL
      }/api/revalidate-template-gallery?${params.toString()}`
    )
    if (!response.ok) {
      return res.status(response.status).json(await response.text())
    }
  } catch (e) {
    return res.status(500).json({ error: 'Error revalidating' })
  }

  return res.status(200).json({ revalidated: true })
}

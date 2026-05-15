import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import fetch from 'node-fetch'

import { isValidTemplateGallerySlug } from '@core/journeys/ui/templateGallerySlug'

import { authConfig } from '../../src/libs/auth/config'

// Authenticated proxy that asks the public journeys app to revalidate a
// template-gallery page. Fire-and-forget from the admin client after a
// mutation succeeds (save, publish, unpublish, assign, reorder, delete).
//
// CSRF posture: POST only + `X-Requested-With: XMLHttpRequest`. `<img>`
// tags can't issue POSTs and cross-site `fetch` can't set custom headers
// without a CORS preflight the admin doesn't allow — together they block
// cookie-borne cross-site invocation.
//
// Unlike `preview-template-gallery.ts`, this endpoint does NOT redirect —
// the caller stays on the admin page. The 300ms edge-cache sleep that the
// preview proxy used is also unnecessary here: we are not about to load the
// public URL in this same flow.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Forbidden' })
  }

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

  const slug = req.query.slug
  if (!isValidTemplateGallerySlug(slug)) {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  // Slug is the only param the upstream needs in the URL. The access
  // token rides in the `Authorization: Bearer` header so it never lands
  // in reverse-proxy / CDN / APM access logs that capture URLs.
  const params = new URLSearchParams({ slug })

  try {
    const response = await fetch(
      `${
        process.env.JOURNEYS_URL
      }/api/revalidate-template-gallery?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN}`
        }
      }
    )
    if (!response.ok) {
      // Log the upstream status server-side for debug; never forward it
      // to the client. Forwarding leaks internal topology — a 401 here
      // tells a CSRF attacker the upstream token mismatched (vs auth /
      // env / network). Normalise every non-2xx upstream response to a
      // generic 502.
      console.error('upstream revalidate failed', {
        status: response.status
      })
      return res.status(502).json({ error: 'Error revalidating' })
    }
  } catch (e) {
    return res.status(500).json({ error: 'Error revalidating' })
  }

  return res.status(200).json({ revalidated: true })
}

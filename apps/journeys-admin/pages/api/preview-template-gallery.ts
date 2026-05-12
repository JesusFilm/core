import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'

import { authConfig } from '../../src/libs/auth/config'

// Authenticated jump-link to the public template gallery page. The admin
// UI hits this proxy so we can gate Preview behind the same auth as the
// rest of the admin app, then redirect to the canonical public URL.
//
// Revalidation lives elsewhere now (see `revalidate-template-gallery.ts`
// + `useRevalidateTemplateGallery`) — the mutating flows (save / publish /
// unpublish / assign / reorder / delete) trigger it directly. Preview is
// purely a read path: it should never write, and it should never wait for
// a revalidate roundtrip.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (process.env.JOURNEYS_URL == null) {
    return res.status(500).json({ error: 'Missing Environment Variables' })
  }

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

  res.redirect(307, `${process.env.JOURNEYS_URL}/template-gallery/${slug}`)
}

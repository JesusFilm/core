import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import fetch from 'node-fetch'

import { isValidTemplateGallerySlug } from '@core/journeys/ui/templateGallerySlug'

import { authConfig } from '../../src/libs/auth/config'

// Authenticated jump-link to the public template gallery page. The admin
// UI hits this proxy so we can gate Preview behind the same auth as the
// rest of the admin app, revalidate the journeys app's ISR cache for the
// slug, then redirect to the canonical public URL.
//
// Belt-and-braces revalidate: mutation success paths (save / publish /
// unpublish / delete via `useCollectionMutations` + `useCollectionForm`)
// fire fire-and-forget revalidates for the same slug. That's the primary
// mechanism. THIS proxy adds an awaited revalidate as a safety net for
// the "click View the page immediately after mutation" race: a user can
// follow the post-publish dialog's CTA in sub-second time, before the
// fire-and-forget mutation-success revalidate has actually landed on
// the journeys app, and the public URL would otherwise serve a stale
// 404 / draft state.
//
// Revalidate failure (non-2xx or thrown) is logged server-side and
// falls through to the redirect — never block the user's click on a
// transient revalidate error. The mutation-success revalidate still
// covers them; this is just the safety net.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const journeysUrl = process.env.JOURNEYS_URL
  const accessToken = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  if (journeysUrl == null || accessToken == null) {
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

  const slug = req.query.slug
  if (!isValidTemplateGallerySlug(slug)) {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  // Await the revalidate so the public URL is fresh by the time the
  // browser follows our 307. Non-2xx or thrown — log + fall through.
  const revalidateParams = new URLSearchParams({
    accessToken,
    slug
  })
  try {
    const response = await fetch(
      `${journeysUrl}/api/revalidate-template-gallery?${revalidateParams.toString()}`
    )
    if (!response.ok) {
      console.warn(
        `[preview-template-gallery] revalidate upstream returned ${response.status} for slug=${slug}; redirecting anyway`
      )
    }
  } catch (err) {
    console.warn(
      `[preview-template-gallery] revalidate fetch threw for slug=${slug}; redirecting anyway:`,
      err instanceof Error ? err.message : err
    )
  }

  res.redirect(307, `${journeysUrl}/template-gallery/${slug}`)
}

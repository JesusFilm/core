import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'

import { isValidTemplateGallerySlug } from '@core/journeys/ui/templateGallerySlug'

import { authConfig } from '../../src/libs/auth/config'

// Authenticated jump-link to the public template gallery page. The admin
// UI hits this proxy so we can gate Preview behind the same auth as the
// rest of the admin app, then redirect to the canonical public URL.
// The public page is server-rendered every request and uses `Cache-
// Control: no-store`; `Query.templateGalleryPageBySlug` is uncached
// in Yoga (TTL 0), so any mutation lands immediately — no explicit
// revalidate step is needed.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Top-level navigation (admin clicks Preview → window.open). Reject
  // anything else so a hostile site can't fire side-effecting calls
  // via `<img>` / `<script>` / `fetch` with a stolen-cookie victim.
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // `Sec-Fetch-Site` is set automatically by browsers on every request
  // and cannot be spoofed from JavaScript. `same-origin` covers our
  // admin → admin navigation; `none` covers direct address-bar entry
  // (legitimate for an admin pasting the URL). Anything else (most
  // notably `cross-site`) is rejected — that closes off third-party
  // links/embeds even when the admin's cookie is SameSite=Lax.
  const fetchSite = req.headers['sec-fetch-site']
  if (
    typeof fetchSite === 'string' &&
    fetchSite !== 'same-origin' &&
    fetchSite !== 'none'
  ) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const journeysUrl = process.env.JOURNEYS_URL
  if (journeysUrl == null) {
    return res.status(500).json({ error: 'Missing Environment Variables' })
  }

  // Validate slug shape BEFORE Firebase token verification — the regex
  // check is microseconds; the token round-trip is hundreds of ms.
  // A malformed slug should 400 immediately without spending an auth
  // call on it (Mike review, NES-1644).
  const slug = req.query.slug
  if (!isValidTemplateGallerySlug(slug)) {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  try {
    const tokens = await getApiRequestTokens(req, authConfig)
    if (tokens == null) {
      return res.status(403).json({ error: 'Not authorized' })
    }
  } catch (e) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  res.redirect(307, `${journeysUrl}/template-gallery/${slug}`)
}

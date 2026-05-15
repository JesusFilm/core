import { timingSafeEqual } from 'crypto'

import type { NextApiRequest, NextApiResponse } from 'next'

import { isValidTemplateGallerySlug } from '@core/journeys/ui/templateGallerySlug'

// Shared-secret comparisons must be constant-time so a remote attacker
// can't recover the token by measuring response latency byte-by-byte.
// `timingSafeEqual` throws on length-mismatched buffers — guard against
// that explicitly and reject without comparing further.
function tokensMatch(provided: unknown, expected: string): boolean {
  if (typeof provided !== 'string') return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// Extract a Bearer token from the `Authorization` header. The header form
// keeps the token out of URLs (and therefore out of reverse-proxy access
// logs, CDN logs, browser history, Referer headers, and APM traces that
// capture full URLs by default). Returns null when the header is missing
// or malformed; callers compare with `tokensMatch` for the constant-time
// check.
function readBearerToken(req: NextApiRequest): string | null {
  const raw = req.headers.authorization
  if (typeof raw !== 'string') return null
  const match = /^Bearer (.+)$/.exec(raw)
  return match?.[1] ?? null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const expectedToken = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  if (expectedToken == null || expectedToken === '') {
    return res.status(500).json({ message: 'Missing Environment Variables' })
  }
  // Reject the legacy `?accessToken=` form outright so the two-path window
  // during migration is closed — clients that haven't updated to the
  // header form get an immediate 401 and operators see the regression.
  if (typeof req.query.accessToken === 'string' && req.query.accessToken !== '') {
    return res.status(401).json({
      message: 'Access token must be supplied via Authorization: Bearer header'
    })
  }
  if (!tokensMatch(readBearerToken(req), expectedToken)) {
    return res.status(401).json({ message: 'Invalid access token' })
  }

  const slug = req.query.slug
  if (!isValidTemplateGallerySlug(slug)) {
    return res.status(400).json({ error: 'Invalid slug' })
  }

  try {
    // Public template-gallery page lives at /home/template-gallery/<slug>
    // (Next rewrite maps your.nextstep.is/template-gallery/<slug> → here).
    // Custom domains can't host gallery pages (NES-1644), so no hostname branch.
    const path = `/home/template-gallery/${slug}`
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

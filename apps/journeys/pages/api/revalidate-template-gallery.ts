import type { NextApiRequest, NextApiResponse } from 'next'

// Same shape we enforce at the admin form layer. Reject anything else
// before passing the value into `res.revalidate()` — without this, a
// caller holding the access token (or a CSRF'd admin reaching us via
// the admin proxy) could revalidate arbitrary ISR paths via `..`/`/`
// segments.
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (
    req.query.accessToken == null ||
    req.query.accessToken !== process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  ) {
    return res.status(401).json({ message: 'Invalid access token' })
  }

  const slug = req.query.slug
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
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

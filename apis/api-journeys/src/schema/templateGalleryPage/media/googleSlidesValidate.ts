import { GraphQLError } from 'graphql'

import { EmbedNormalizerSpec } from './types'

// Google Slides has no oEmbed and no API to resolve an arbitrary URL into an
// embeddable one, so this is positive-acceptance shape validation: the URL must
// be a presentation that has been "Published to web", the only shape that
// renders in an iframe. The single rewrite we perform is `/pub` → `/embed`
// (see below) because the published "Link" URL is X-Frame-Options blocked.

async function normalize(url: string): Promise<{ embedUrl: string }> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new GraphQLError('Invalid Google Slides URL.', {
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'GOOGLE_SLIDES_INVALID_URL'
      }
    })
  }

  const segments = parsed.pathname.split('/').filter(Boolean)
  if (
    parsed.hostname !== 'docs.google.com' ||
    segments[0] !== 'presentation' ||
    segments[1] !== 'd'
  ) {
    throw new GraphQLError('URL must be a docs.google.com presentation link.', {
      extensions: {
        code: 'BAD_USER_INPUT',
        reason: 'GOOGLE_SLIDES_INVALID_URL'
      }
    })
  }

  // Anchor the published-state check to path SEGMENTS, not substrings. A
  // private `/edit` URL whose document id merely starts with "pub"/"embed"
  // (e.g. /presentation/d/pubXYZ/edit) must NOT pass — that silent
  // false-positive stores a broken iframe, the exact NES-1660 failure this
  // targets. Published shapes are the `/d/e/{id}/…` published-id namespace, or
  // a trailing `pub` / `pubhtml` / `embed` segment.
  const lastSegment = segments[segments.length - 1]
  const isPublished =
    segments[2] === 'e' ||
    lastSegment === 'pub' ||
    lastSegment === 'pubhtml' ||
    lastSegment === 'embed'
  if (!isPublished) {
    throw new GraphQLError(
      'This Google Slides URL is not published. In Slides, use File → Share → Publish to web, then paste the published link.',
      {
        extensions: {
          code: 'BAD_USER_INPUT',
          reason: 'GOOGLE_SLIDES_NOT_PUBLISHED'
        }
      }
    )
  }

  // The published "Link" URL ends in `/pub` (or `/pubhtml`), but that page is
  // served with `X-Frame-Options: SAMEORIGIN`, so the browser refuses to render
  // it in our cross-origin iframe. The sibling `/embed` page carries no such
  // header. Rewrite the trailing segment so a user can paste the more-prominent
  // "Publish to web → Link" URL and still get an embeddable result; a URL that
  // already ends in `/embed` passes through unchanged. Query params (start /
  // loop / delayms) are preserved by URL serialization.
  if (lastSegment === 'pub' || lastSegment === 'pubhtml') {
    segments[segments.length - 1] = 'embed'
    parsed.pathname = `/${segments.join('/')}`
    return { embedUrl: parsed.toString() }
  }

  return { embedUrl: url }
}

export const googleSlidesSpec: EmbedNormalizerSpec = {
  hosts: ['docs.google.com'],
  normalize
}

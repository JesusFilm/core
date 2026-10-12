import { prisma } from '@core/prisma/journeys/client'

import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  JourneyWithPublicUrl
} from './getJourneyPublicUrl'
import { badUserInput } from './validation'

export const JOURNEY_NOT_FOUND_MESSAGE = 'Journey not found or not published'

/** How a pasted journey link addresses the journey: an admin link by id, a public URL by slug. */
export type JourneyLink = { id: string } | { slug: string }

/**
 * Parse a pasted journey link: an admin link (`/journeys/<id>`), the embed
 * route (`/embed/<slug>`) or a public URL on any domain (`/<slug>`). Anything
 * that is not an http(s) URL with a path, or that names nothing, is
 * `BAD_USER_INPUT` on `url`.
 */
export function parseJourneyLink(url: string): JourneyLink {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    throw badUserInput('url must be a journey link', 'url')
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
    throw badUserInput('url must be a journey link', 'url')
  const segments = parsed.pathname
    .split('/')
    .filter((segment) => segment !== '')
  const [first, second] = segments
  if (first == null) throw badUserInput('url must be a journey link', 'url')
  if (first === 'journeys' && second != null) return { id: second }
  if (first === 'embed' && second != null) return { slug: second }
  return { slug: first }
}

/**
 * Resolve a pasted link to a live-published journey of any team, with the
 * routing filter skipped (PRD §5): an unknown journey and an unpublished one
 * are the same `BAD_USER_INPUT` on `url`, never `NOT_FOUND`.
 */
export async function resolveJourneyLink(
  url: string
): Promise<JourneyWithPublicUrl> {
  const link = parseJourneyLink(url)
  const journey = await prisma.journey.findFirst({
    where: {
      ...('id' in link ? { id: link.id } : { slug: link.slug }),
      status: 'published',
      deletedAt: null
    },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null) throw badUserInput(JOURNEY_NOT_FOUND_MESSAGE, 'url')
  return journey
}

/** A journey addressed by id must likewise be live-published. */
export async function resolveJourneyId(
  journeyId: string,
  field = 'journeyId'
): Promise<JourneyWithPublicUrl> {
  const journey = await prisma.journey.findFirst({
    where: { id: journeyId, status: 'published', deletedAt: null },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null) throw badUserInput(JOURNEY_NOT_FOUND_MESSAGE, field)
  return journey
}

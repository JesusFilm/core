import { prisma } from '@core/prisma/journeys/client'

import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  JourneyWithPublicUrl
} from './getJourneyPublicUrl'
import { badUserInput, isOneOf } from './validation'

export const JOURNEY_NOT_FOUND_MESSAGE = 'Journey not found or not published'

/** The refusal where an archived journey is accepted too: a journey card. */
export const CARD_JOURNEY_NOT_FOUND_MESSAGE =
  'Journey not found, or not published or archived'

/** How a pasted journey link addresses the journey: an admin link by id, a public URL by slug. */
export type JourneyLink = { id: string } | { slug: string }

type LinkableStatus = 'published' | 'archived'

/** What a journey card may point at: the statuses the public page shows (published or archived). */
export const CARD_JOURNEY_STATUSES: LinkableStatus[] = ['published', 'archived']

/** Whether a journey status is one a card may point at and visitors may reach. */
export const isCardJourneyStatus = isOneOf(CARD_JOURNEY_STATUSES)

function notFoundMessage(statuses: LinkableStatus[]): string {
  return statuses.includes('archived')
    ? CARD_JOURNEY_NOT_FOUND_MESSAGE
    : JOURNEY_NOT_FOUND_MESSAGE
}

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
  url: string,
  statuses: LinkableStatus[] = ['published']
): Promise<JourneyWithPublicUrl> {
  const link = parseJourneyLink(url)
  const journey = await prisma.journey.findFirst({
    where: {
      ...('id' in link ? { id: link.id } : { slug: link.slug }),
      status: { in: statuses },
      deletedAt: null
    },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null) throw badUserInput(notFoundMessage(statuses), 'url')
  return journey
}

/** A journey addressed by id must likewise be live-published. */
export async function resolveJourneyId(
  journeyId: string,
  field = 'journeyId',
  statuses: LinkableStatus[] = ['published']
): Promise<JourneyWithPublicUrl> {
  const journey = await prisma.journey.findFirst({
    where: {
      id: journeyId,
      status: { in: statuses },
      deletedAt: null
    },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null) throw badUserInput(notFoundMessage(statuses), field)
  return journey
}

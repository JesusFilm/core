import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action, ability, subject } from '../../lib/auth/ability'

import { badUserInput, forbidden } from './errors'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  JourneyWithPublicUrl
} from './getJourneyPublicUrl'
import { isOneOf } from './validation'

export const JOURNEY_NOT_FOUND_MESSAGE = 'Journey not found or not published'

/** The refusal of a Share Language link to a journey whose stats the caller cannot see. */
export const SHARE_LANGUAGE_JOURNEY_FORBIDDEN_MESSAGE =
  'You can only link a journey whose stats you can see'

/** A Share Language journey as resolved: its public URL plus what the journey ACL reads. */
const INCLUDE_SHARE_LANGUAGE_JOURNEY = {
  ...INCLUDE_JOURNEY_PUBLIC_URL,
  team: {
    include: { ...INCLUDE_JOURNEY_PUBLIC_URL.team.include, userTeams: true }
  },
  userJourneys: true
} satisfies Prisma.JourneyInclude

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

/** The journey `link` addresses in one of `statuses`, not deleted. */
function linkableJourneyWhere(
  link: JourneyLink,
  statuses: LinkableStatus[]
): Prisma.JourneyWhereInput {
  return {
    ...('id' in link ? { id: link.id } : { slug: link.slug }),
    status: { in: statuses },
    deletedAt: null
  }
}

/**
 * The journey `link` addresses in one of `statuses`, not deleted; anything
 * else is `BAD_USER_INPUT` on `field`.
 */
async function findLinkableJourney(
  link: JourneyLink,
  statuses: LinkableStatus[],
  field: string
): Promise<JourneyWithPublicUrl> {
  const journey = await prisma.journey.findFirst({
    where: linkableJourneyWhere(link, statuses),
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })
  if (journey == null) throw badUserInput(notFoundMessage(statuses), field)
  return journey
}

/**
 * Resolve a pasted link to a live-published journey of any team, with the
 * routing filter skipped (GLOSSARY.md: Campaign access): an unknown journey
 * and an unpublished one are the same `BAD_USER_INPUT` on `url`, never
 * `NOT_FOUND`.
 */
export async function resolveJourneyLink(
  url: string,
  statuses: LinkableStatus[] = ['published']
): Promise<JourneyWithPublicUrl> {
  return await findLinkableJourney(parseJourneyLink(url), statuses, 'url')
}

/** A journey addressed by id must likewise be live-published. */
export async function resolveJourneyId(
  journeyId: string,
  field = 'journeyId',
  statuses: LinkableStatus[] = ['published']
): Promise<JourneyWithPublicUrl> {
  return await findLinkableJourney({ id: journeyId }, statuses, field)
}

/**
 * Resolve the journey a Share Language links to. Its visitors feed the public
 * Campaign Stats, so the caller must already be allowed to see its stats
 * (GLOSSARY.md: Campaign access): the journey `Update` the Plausible stats
 * queries check. A journey that is unknown or not live-published is
 * `BAD_USER_INPUT` on `field`, one the caller may not see is `FORBIDDEN` on
 * `field`.
 */
export async function resolveShareLanguageJourney(
  link: JourneyLink,
  field: string,
  user: User
): Promise<JourneyWithPublicUrl> {
  const journey = await prisma.journey.findFirst({
    where: linkableJourneyWhere(link, ['published']),
    include: INCLUDE_SHARE_LANGUAGE_JOURNEY
  })
  if (journey == null) throw badUserInput(JOURNEY_NOT_FOUND_MESSAGE, field)
  if (!ability(Action.Update, subject('Journey', journey), user))
    throw forbidden(SHARE_LANGUAGE_JOURNEY_FORBIDDEN_MESSAGE, field)
  return journey
}

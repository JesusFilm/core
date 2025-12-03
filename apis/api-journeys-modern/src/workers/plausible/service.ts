import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  createHttpLink,
  gql
} from '@apollo/client'
import { Job } from 'bullmq'
import chunk from 'lodash/chunk'
import { Logger } from 'pino'

import { JourneyPlausibleEvents } from '@core/journeys/ui/plausibleHelpers'
import { prisma } from '@core/prisma/journeys/client'

import { env } from '../../env'

interface PlausibleCreateSitesJob {
  __typename: 'plausibleCreateSites'
}

interface PlausibleCreateTeamSiteJob {
  __typename: 'plausibleCreateTeamSite'
  teamId: string
}

interface PlausibleCreateJourneySiteJob {
  __typename: 'plausibleCreateJourneySite'
  journeyId: string
}

type PlausibleJob =
  | PlausibleCreateSitesJob
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob

type MutationSiteCreateSuccess = {
  __typename: 'MutationSiteCreateSuccess'
  data: {
    sharedLinks: Array<{ slug: string }>
  }
}

type MutationSiteCreateError = {
  __typename: 'Error'
  message?: string | null
}

type MutationSiteCreateResult =
  | MutationSiteCreateSuccess
  | MutationSiteCreateError

export const SITE_CREATE = gql(`
  mutation SiteCreate($input: SiteCreateInput!) {
    siteCreate(input: $input) {
      ... on Error {
        message
        __typename
      }
      ... on MutationSiteCreateSuccess {
        data {
          id
          domain
          __typename
          memberships {
            id
            role
            __typename
          }
          goals {
            id
            eventName
            __typename
          }
          sharedLinks {
            id
            slug
            __typename
          }
        }
      }
    }
  }
`)

const goals: Array<keyof JourneyPlausibleEvents> = [
  'footerThumbsUpButtonClick',
  'footerThumbsDownButtonClick',
  'shareButtonClick',
  'pageview',
  'navigatePreviousStep',
  'navigateNextStep',
  'buttonClick',
  'chatButtonClick',
  'footerChatButtonClick',
  'radioQuestionSubmit',
  'signUpSubmit',
  'textResponseSubmit',
  'videoPlay',
  'videoPause',
  'videoExpand',
  'videoCollapse',
  'videoStart',
  'videoProgress25',
  'videoProgress50',
  'videoProgress75',
  'videoComplete',
  'videoTrigger'
]

const httpLink = createHttpLink({
  uri: env.GATEWAY_URL,
  fetch,
  headers: {
    Authorization: `Bearer ${env.PLAUSIBLE_API_KEY}`,
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': env.SERVICE_VERSION
  }
})

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const BATCH_SIZE = 5

/**
 * Build the Plausible site identifier for a journey.
 *
 * @param journeyId - The journey's unique identifier
 * @returns The site id in the form `api-journeys-journey-<journeyId>`
 */
function journeySiteId(journeyId: string): string {
  return `api-journeys-journey-${journeyId}`
}

/**
 * Build the Plausible site identifier for a team.
 *
 * @param teamId - The team's unique identifier used to generate the site id
 * @returns The Plausible site id in the form `api-journeys-team-<teamId>`
 */
function teamSiteId(teamId: string): string {
  return `api-journeys-team-${teamId}`
}

/**
 * Creates a Plausible site for the given domain using the SITE_CREATE mutation.
 *
 * @param domain - The domain to register as the Plausible site (for example a generated site id or hostname).
 * @returns The GraphQL mutation result (`MutationSiteCreateResult`) if available, or `undefined` when no data is returned.
 */
async function createSite(
  domain: string
): Promise<MutationSiteCreateResult | undefined> {
  const { data } = await client.mutate({
    mutation: SITE_CREATE,
    variables: {
      input: {
        domain,
        goals: goals as string[]
      }
    }
  })
  return data?.siteCreate
}

/**
 * Create a Plausible site for a journey and persist its sharing slug to the journey record.
 *
 * Attempts to create a Plausible site for the given journeyId, updates the corresponding
 * Journey.prisma record's `plausibleToken` with the site's first shared link slug on success,
 * and logs warnings if site creation or slug extraction fails.
 *
 * @param param0 - Object containing the `journeyId` of the journey to create a site for
 * @param logger - Optional pino logger used for informational and warning messages
 */
async function createJourneySite(
  { journeyId }: PlausibleCreateJourneySiteJob,
  logger?: Logger
): Promise<void> {
  const site = await createSite(journeySiteId(journeyId))
  if (site == null || site.__typename !== 'MutationSiteCreateSuccess') {
    logger?.warn({ journeyId }, 'failed to create journey site in Plausible')
    return
  }

  const slug = site.data.sharedLinks?.[0]?.slug
  if (slug == null) {
    logger?.warn(
      { journeyId },
      'missing plausible slug in journey site sharedLinks'
    )
    return
  }

  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      plausibleToken: slug
    }
  })
  logger?.info({ journeyId }, 'journey site created in Plausible')
}

/**
 * Creates a Plausible site for a team and stores the resulting shared link slug on the team record.
 *
 * If site creation fails or the response lacks a shared link slug, a warning is logged and no database update is performed. On success, the team's `plausibleToken` is updated with the returned slug and an informational log is emitted.
 */
async function createTeamSite(
  { teamId }: PlausibleCreateTeamSiteJob,
  logger?: Logger
): Promise<void> {
  const site = await createSite(teamSiteId(teamId))
  if (site == null || site.__typename !== 'MutationSiteCreateSuccess') {
    logger?.warn({ teamId }, 'failed to create team site in Plausible')
    return
  }

  const slug = site.data.sharedLinks?.[0]?.slug
  if (slug == null) {
    logger?.warn({ teamId }, 'missing plausible slug in team site sharedLinks')
    return
  }

  await prisma.team.update({
    where: { id: teamId },
    data: {
      plausibleToken: slug
    }
  })
  logger?.info({ teamId }, 'team site created in Plausible')
}

/**
 * Creates Plausible sites for teams and journeys that do not have a `plausibleToken`.
 *
 * Processes teams and journeys in batches (size controlled by BATCH_SIZE), creates a site for each entity, and persists the returned Plausible site token onto the corresponding Team or Journey record.
 */
async function createSites(logger?: Logger): Promise<void> {
  logger?.info('creating team sites...')
  const teamIds = (
    await prisma.team.findMany({
      where: { plausibleToken: null },
      select: { id: true }
    })
  ).map(({ id }) => id)

  for (const ids of chunk(teamIds, BATCH_SIZE)) {
    await Promise.all(
      ids.map(
        async (teamId) =>
          await createTeamSite(
            { __typename: 'plausibleCreateTeamSite', teamId },
            logger
          )
      )
    )
  }

  logger?.info('creating journey sites...')
  const journeyIds = (
    await prisma.journey.findMany({
      where: { plausibleToken: null },
      select: { id: true }
    })
  ).map(({ id }) => id)

  for (const ids of chunk(journeyIds, BATCH_SIZE)) {
    await Promise.all(
      ids.map(
        async (journeyId) =>
          await createJourneySite(
            { __typename: 'plausibleCreateJourneySite', journeyId },
            logger
          )
      )
    )
  }
}

/**
 * Dispatches Plausible-related jobs to the matching handler based on the job's `__typename`.
 *
 * Processes three job variants: batch creation of sites, creation of a team site, and creation of a journey site. Logs a warning for unknown job types.
 *
 * @param job - The BullMQ job whose `data.__typename` determines which Plausible operation to run.
 * @param logger - Optional pino logger used for progress and warning messages.
 */
export async function service(
  job: Job<PlausibleJob>,
  logger?: Logger
): Promise<void> {
  switch (job.data.__typename) {
    case 'plausibleCreateSites':
      await createSites(logger)
      break
    case 'plausibleCreateTeamSite':
      await createTeamSite(job.data, logger)
      break
    case 'plausibleCreateJourneySite':
      await createJourneySite(job.data, logger)
      break
    default:
      logger?.warn({ job: job.data }, 'unknown plausible job type')
  }
}
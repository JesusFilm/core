import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  gql
} from '@apollo/client'
import { Job } from 'bullmq'
import chunk from 'lodash/chunk'
import { Logger } from 'pino'

// The React-free site definition, not the `campaignPlausible` barrel, which
// also exports the hook.
import {
  campaignAllowedProps,
  campaignGoals,
  campaignSiteId
} from '@core/journeys/ui/campaignPlausible/campaignPlausibleSite'
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

interface PlausibleCreateTemplateSiteJob {
  __typename: 'plausibleCreateTemplateSite'
  templateId: string
}

interface PlausibleCreateCampaignSiteJob {
  __typename: 'plausibleCreateCampaignSite'
  campaignId: string
}

type PlausibleJob =
  | PlausibleCreateSitesJob
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob
  | PlausibleCreateTemplateSiteJob
  | PlausibleCreateCampaignSiteJob

type MutationSiteCreateSuccess = {
  __typename: 'MutationSiteCreateSuccess'
  data: {
    sharedLinks?: Array<{ slug: string }>
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
  mutation SiteCreate($input: SiteCreateInput!, $includeSharedLinks: Boolean = true) {
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
          sharedLinks @include(if: $includeSharedLinks) {
            id
            slug
            __typename
          }
        }
      }
    }
  }
`)

export const goals: Array<keyof JourneyPlausibleEvents> = [
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
  'videoTrigger',
  'multiSelectSubmit',
  // Capture events are triggered by journey events above
  'prayerRequestCapture',
  'christDecisionCapture',
  'gospelStartCapture',
  'gospelCompleteCapture',
  'rsvpCapture',
  'specialVideoStartCapture',
  'specialVideoCompleteCapture',
  'custom1Capture',
  'custom2Capture',
  'custom3Capture'
]

const httpLink = new HttpLink({
  uri: env.GATEWAY_URL,
  fetch,
  headers: {
    Authorization: `Bearer ${env.PLAUSIBLE_API_KEY}`,
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': env.SERVICE_VERSION
  }
})

const client: ApolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const BATCH_SIZE = 5

function journeySiteId(journeyId: string): string {
  return `api-journeys-journey-${journeyId}`
}

function teamSiteId(teamId: string): string {
  return `api-journeys-team-${teamId}`
}

function templateSiteId(templateId: string): string {
  return `api-journeys-template-${templateId}`
}

interface CreateSiteOptions {
  /** Create no shared link (template sites have no embeddable dashboard). */
  disableSharedLinks?: boolean
  /** The site's goals; journey, team and template sites get the journey goals. */
  goals?: string[]
  /** The custom props its dashboard shows; none unless given. */
  allowedEventProps?: string[]
}

async function createSite(
  domain: string,
  {
    disableSharedLinks = false,
    goals: siteGoals = goals as string[],
    allowedEventProps
  }: CreateSiteOptions = {}
): Promise<MutationSiteCreateResult | undefined> {
  const { data } = await client.mutate<{
    siteCreate: MutationSiteCreateResult
  }>({
    mutation: SITE_CREATE,
    variables: {
      input: {
        domain,
        goals: siteGoals,
        disableSharedLinks,
        allowedEventProps
      },
      includeSharedLinks: !disableSharedLinks
    }
  })
  return data?.siteCreate
}

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

async function createTemplateSite(
  { templateId }: PlausibleCreateTemplateSiteJob,
  logger?: Logger
): Promise<void> {
  // Verify the journey exists, is a template, and doesn't already have a template site
  const journey = await prisma.journey.findFirst({
    where: {
      id: templateId,
      template: true,
      templateSite: { not: true }
    },
    select: { id: true }
  })

  if (journey == null) {
    logger?.warn(
      { templateId },
      'Cannot create template site for journey. Make sure the journey exists, is a template, and does not already have a template site.'
    )
    return
  }

  const site = await createSite(templateSiteId(templateId), {
    disableSharedLinks: true
  })
  if (site == null || site.__typename !== 'MutationSiteCreateSuccess') {
    logger?.warn({ templateId }, 'failed to create template site in Plausible')
    return
  }

  await prisma.journey.update({
    where: { id: templateId },
    data: {
      templateSite: true
    }
  })
  logger?.info({ templateId }, 'template site created in Plausible')
}

/**
 * Create a Campaign's own site and store its shared-link token. Throws when
 * Plausible gives no site or no shared link, so the queued job fails and BullMQ
 * retries it (`campaignCreate` queues it with bounded attempts); the startup
 * backfill catches per campaign instead. A campaign deleted before the token is
 * stored is not a failure.
 */
async function createCampaignSite(
  { campaignId }: PlausibleCreateCampaignSiteJob,
  logger?: Logger
): Promise<void> {
  const site = await createSite(campaignSiteId(campaignId), {
    goals: campaignGoals,
    allowedEventProps: campaignAllowedProps
  })
  if (site == null || site.__typename !== 'MutationSiteCreateSuccess')
    throw new Error('failed to create campaign site in Plausible')

  const slug = site.data.sharedLinks?.[0]?.slug
  if (slug == null)
    throw new Error('missing plausible slug in campaign site sharedLinks')

  // Campaigns are hard-deleted, so the row may be gone by the time the job runs.
  const { count } = await prisma.campaign.updateMany({
    where: { id: campaignId },
    data: { plausibleToken: slug }
  })
  if (count === 0) {
    logger?.warn(
      { campaignId },
      'campaign deleted before its Plausible site was stored'
    )
    return
  }
  logger?.info({ campaignId }, 'campaign site created in Plausible')
}

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

  logger?.info('creating template sites...')
  const templateIds = (
    await prisma.journey.findMany({
      where: {
        template: true,
        templateSite: { not: true }
      },
      select: { id: true }
    })
  ).map(({ id }) => id)

  for (const ids of chunk(templateIds, BATCH_SIZE)) {
    await Promise.all(
      ids.map(
        async (templateId) =>
          await createTemplateSite(
            { __typename: 'plausibleCreateTemplateSite', templateId },
            logger
          )
      )
    )
  }

  // Every campaign, not just those without a site: `siteCreate` returns an
  // existing site and adds any of `campaignAllowedProps` it lacks, so a prop
  // added later reaches older sites on the next start. Goals do not: an
  // existing site keeps the goals it was created with.
  logger?.info('creating campaign sites...')
  const campaignIds = (
    await prisma.campaign.findMany({ select: { id: true } })
  ).map(({ id }) => id)

  for (const ids of chunk(campaignIds, BATCH_SIZE)) {
    await Promise.all(
      ids.map(async (campaignId) => {
        // One campaign's failure must not abort the rest of the backfill;
        // it is retried by the next one.
        try {
          await createCampaignSite(
            { __typename: 'plausibleCreateCampaignSite', campaignId },
            logger
          )
        } catch (error) {
          logger?.warn(
            { campaignId, error },
            'failed to create campaign site in Plausible'
          )
        }
      })
    )
  }
}

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
    case 'plausibleCreateTemplateSite':
      await createTemplateSite(job.data, logger)
      break
    case 'plausibleCreateCampaignSite':
      await createCampaignSite(job.data, logger)
      break
    default:
      logger?.warn({ job: job.data }, 'unknown plausible job type')
  }
}

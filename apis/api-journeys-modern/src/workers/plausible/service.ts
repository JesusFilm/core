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

interface PlausibleCreateTemplateSiteJob {
  __typename: 'plausibleCreateTemplateSite'
  templateId: string
}

type PlausibleJob =
  | PlausibleCreateSitesJob
  | PlausibleCreateTeamSiteJob
  | PlausibleCreateJourneySiteJob
  | PlausibleCreateTemplateSiteJob

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

function journeySiteId(journeyId: string): string {
  return `api-journeys-journey-${journeyId}`
}

function teamSiteId(teamId: string): string {
  return `api-journeys-team-${teamId}`
}

function templateSiteId(templateId: string): string {
  return `api-journeys-template-${templateId}`
}

async function createSite(
  domain: string,
  disableSharedLinks = false
): Promise<MutationSiteCreateResult | undefined> {
  const { data } = await client.mutate({
    mutation: SITE_CREATE,
    variables: {
      input: {
        domain,
        goals: goals as string[],
        disableSharedLinks
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

  const site = await createSite(templateSiteId(templateId), true)
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
    default:
      logger?.warn({ job: job.data }, 'unknown plausible job type')
  }
}

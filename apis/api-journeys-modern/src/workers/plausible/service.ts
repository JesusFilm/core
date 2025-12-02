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
  uri: process.env.GATEWAY_URL,
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

async function createJourneySite(
  { journeyId }: PlausibleCreateJourneySiteJob,
  logger?: Logger
): Promise<void> {
  const site = await createSite(journeySiteId(journeyId))
  if (site == null || site.__typename !== 'MutationSiteCreateSuccess') {
    logger?.warn({ journeyId }, 'failed to create journey site in Plausible')
    return
  }

  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      plausibleToken: site.data.sharedLinks[0].slug
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

  await prisma.team.update({
    where: { id: teamId },
    data: {
      plausibleToken: site.data.sharedLinks[0].slug
    }
  })
  logger?.info({ teamId }, 'team site created in Plausible')
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
    default:
      logger?.warn({ job: job.data }, 'unknown plausible job type')
  }
}

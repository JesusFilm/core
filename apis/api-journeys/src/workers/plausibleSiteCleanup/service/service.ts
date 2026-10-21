import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client'
import { Job } from 'bullmq'
import chunk from 'lodash/chunk'
import uniq from 'lodash/uniq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/journeys/client'

import { env } from '../../../env'

interface PlausibleSiteCleanupJob {
  __typename: 'plausibleSiteCleanup'
  dryRun?: boolean
}

interface Site {
  id: string
  domain: string
}

type SitesDeleteResult =
  | { __typename: 'MutationSitesDeleteSuccess'; data: number }
  | { __typename: 'Error'; message: string }

// Every site api-journeys creates is named after the journey, team or template
// it reports on (see workers/plausible). A template site uses its journey's id.
const SITE_PREFIX = 'api-journeys-'
const SITE_DOMAIN = /^api-journeys-(journey|team|template)-(.+)$/
const PAGE_SIZE = 1000
const DELETE_BATCH_SIZE = 100

export const SITES = gql`
  query PlausibleSiteCleanupSites(
    $domainStartsWith: String
    $after: String
    $first: Int
  ) {
    sites(domainStartsWith: $domainStartsWith, after: $after, first: $first) {
      id
      domain
    }
  }
`

export const SITES_DELETE = gql`
  mutation PlausibleSiteCleanupSitesDelete($domains: [String!]!) {
    sitesDelete(domains: $domains) {
      __typename
      ... on Error {
        message
      }
      ... on MutationSitesDeleteSuccess {
        data
      }
    }
  }
`

const client = new ApolloClient({
  link: new HttpLink({
    uri: env.GATEWAY_URL,
    fetch,
    headers: {
      Authorization: `Bearer ${env.PLAUSIBLE_API_KEY}`,
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': env.SERVICE_VERSION
    }
  }),
  cache: new InMemoryCache()
})

interface SiteOwner {
  model: 'journey' | 'team'
  id: string
}

export function siteOwner(domain: string): SiteOwner | null {
  const match = SITE_DOMAIN.exec(domain)
  if (match == null) return null
  return { model: match[1] === 'team' ? 'team' : 'journey', id: match[2] }
}

/**
 * The domains in this page whose journey or team no longer exists. Soft-deleted
 * rows still count as existing; only hard-deleted ones orphan a site. Domains
 * that don't follow the api-journeys pattern are never returned.
 */
async function orphanedDomains(sites: Site[]): Promise<string[]> {
  const owned = sites.flatMap(({ domain }) => {
    const owner = siteOwner(domain)
    return owner == null ? [] : [{ domain, owner }]
  })
  const idsOf = (model: SiteOwner['model']): string[] =>
    uniq(
      owned
        .filter(({ owner }) => owner.model === model)
        .map(({ owner }) => owner.id)
    )
  const journeyIds = idsOf('journey')
  const teamIds = idsOf('team')

  const [journeys, teams] = await Promise.all([
    journeyIds.length > 0
      ? prisma.journey.findMany({
          where: { id: { in: journeyIds } },
          select: { id: true }
        })
      : [],
    teamIds.length > 0
      ? prisma.team.findMany({
          where: { id: { in: teamIds } },
          select: { id: true }
        })
      : []
  ])
  const existing = new Set([
    ...journeys.map(({ id }) => `journey:${id}`),
    ...teams.map(({ id }) => `team:${id}`)
  ])

  return owned
    .filter(({ owner }) => !existing.has(`${owner.model}:${owner.id}`))
    .map(({ domain }) => domain)
}

async function fetchSites(after?: string): Promise<Site[]> {
  const { data } = await client.query<{ sites: Site[] }>({
    query: SITES,
    variables: { domainStartsWith: SITE_PREFIX, after, first: PAGE_SIZE },
    fetchPolicy: 'no-cache'
  })
  return data?.sites ?? []
}

async function deleteSites(domains: string[]): Promise<number> {
  const { data } = await client.mutate<{ sitesDelete: SitesDeleteResult }>({
    mutation: SITES_DELETE,
    variables: { domains }
  })
  const result = data?.sitesDelete
  if (result == null) throw new Error('sitesDelete returned no result')
  if (result.__typename === 'Error') throw new Error(result.message)
  return result.data
}

/**
 * Deletes the Plausible sites api-journeys created for journeys and teams that
 * have since been hard-deleted (by the e2e and anonymous journey cleanups, or
 * a user deletion). Left alone they pile up, and Plausible loads every site
 * into memory when it starts.
 */
export async function service(
  job: Job<PlausibleSiteCleanupJob>,
  logger?: Logger
): Promise<void> {
  const dryRun = job.data.dryRun === true

  // An empty journeys database would make every site look orphaned.
  if ((await prisma.journey.count()) === 0) {
    logger?.warn('no journeys found; skipping plausible site cleanup')
    return
  }

  let after: string | undefined
  let checked = 0
  let orphaned = 0
  let deleted = 0

  while (true) {
    const sites = await fetchSites(after)
    if (sites.length === 0) break
    checked += sites.length
    after = sites[sites.length - 1].id

    const domains = await orphanedDomains(sites)
    orphaned += domains.length
    if (dryRun) {
      if (domains.length > 0)
        logger?.info(
          { count: domains.length, sample: domains.slice(0, 10) },
          'DRY RUN: would delete plausible sites'
        )
    } else {
      for (const batch of chunk(domains, DELETE_BATCH_SIZE)) {
        deleted += await deleteSites(batch)
      }
    }

    if (sites.length < PAGE_SIZE) break
  }

  logger?.info(
    { checked, orphaned, deleted, dryRun },
    'plausible site cleanup finished'
  )
}

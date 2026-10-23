import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client'
import { Job } from 'bullmq'
import type { DocumentNode } from 'graphql'
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

type DeleteResult =
  | {
      __typename:
        | 'MutationSitesDeletePrepareSuccess'
        | 'MutationSitesDeleteSuccess'
      data: number
    }
  | { __typename: 'Error'; message: string }

// Every site api-journeys creates is named after the journey, team or template
// it reports on (see workers/plausible). A template site uses its journey's id.
const SITE_PREFIX = 'api-journeys-'
const SITE_DOMAIN = /^api-journeys-(journey|team|template)-(.+)$/
const PAGE_SIZE = 1000
const PROGRESS_EVERY_PAGES = 10
const MAX_CONSECUTIVE_FAILURES = 5
const SAMPLE_SIZE = 10

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

export const SITES_DELETE_PREPARE = gql`
  mutation PlausibleSiteCleanupSitesDeletePrepare($domains: [String!]!) {
    sitesDeletePrepare(domains: $domains) {
      __typename
      ... on Error {
        message
      }
      ... on MutationSitesDeletePrepareSuccess {
        data
      }
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

type PassName = 'prepare' | 'delete'

interface Pass {
  mutation: DocumentNode
  field: 'sitesDeletePrepare' | 'sitesDelete'
  batchSize: number
  /** How many batches are sent at once. */
  concurrency: number
}

// Plausible's database has no site_id index on goals or setup_help_emails, so
// each site deleted makes Postgres read both tables in full. The prepare pass
// clears every orphan's rows out of them first, in big batches (one read per
// batch), so the delete pass only has small tables to read per site. Goals of
// live sites remain, so each delete is still a full read of goals; running
// several batches at once spreads those reads across the database's CPUs.
const PASSES: Record<PassName, Pass> = {
  prepare: {
    mutation: SITES_DELETE_PREPARE,
    field: 'sitesDeletePrepare',
    batchSize: 500,
    concurrency: 1
  },
  delete: {
    mutation: SITES_DELETE,
    field: 'sitesDelete',
    batchSize: 20,
    concurrency: 4
  }
}

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

async function runBatch(pass: Pass, domains: string[]): Promise<number> {
  const { data } = await client.mutate<Record<string, DeleteResult>>({
    mutation: pass.mutation,
    variables: { domains }
  })
  const result = data?.[pass.field]
  if (result == null) throw new Error(`${pass.field} returned no result`)
  if (result.__typename === 'Error') throw new Error(result.message)
  return result.data
}

interface PassResult {
  checked: number
  orphaned: number
  rows: number
  failedBatches: number
  sample: string[]
}

/**
 * Pages through every api-journeys site and runs the pass over the orphans,
 * a few batches at a time. A failed batch is logged and skipped, since the next run
 * finds its sites again; several failures in a row end the run.
 */
async function runPass(
  name: PassName,
  dryRun: boolean,
  logger?: Logger
): Promise<PassResult> {
  const pass = PASSES[name]
  const result: PassResult = {
    checked: 0,
    orphaned: 0,
    rows: 0,
    failedBatches: 0,
    sample: []
  }
  let consecutiveFailures = 0
  let after: string | undefined
  let pages = 0

  while (true) {
    const sites = await fetchSites(after)
    if (sites.length === 0) break
    pages++
    result.checked += sites.length
    after = sites[sites.length - 1].id

    const domains = await orphanedDomains(sites)
    result.orphaned += domains.length
    result.sample.push(...domains.slice(0, SAMPLE_SIZE - result.sample.length))

    if (!dryRun) {
      const batches = chunk(domains, pass.batchSize)
      for (const group of chunk(batches, pass.concurrency)) {
        const settled = await Promise.allSettled(
          group.map(async (batch) => await runBatch(pass, batch))
        )
        let lastError: unknown
        settled.forEach((outcome, index) => {
          if (outcome.status === 'fulfilled') {
            result.rows += outcome.value
            consecutiveFailures = 0
            return
          }
          const batch = group[index]
          lastError = outcome.reason
          result.failedBatches++
          consecutiveFailures++
          logger?.warn(
            {
              pass: name,
              error: outcome.reason,
              size: batch.length,
              firstDomain: batch[0]
            },
            'plausible site cleanup batch failed'
          )
        })
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) throw lastError
      }
    }

    if (pages % PROGRESS_EVERY_PAGES === 0)
      logger?.info(
        {
          pass: name,
          checked: result.checked,
          orphaned: result.orphaned,
          rows: result.rows,
          failedBatches: result.failedBatches
        },
        'plausible site cleanup progress'
      )
    if (sites.length < PAGE_SIZE) break
  }

  return result
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

  if (dryRun) {
    const { checked, orphaned, sample } = await runPass('delete', true, logger)
    logger?.info(
      { checked, orphaned, sample },
      'DRY RUN: would delete plausible sites'
    )
    return
  }

  const prepared = await runPass('prepare', false, logger)
  const deleted = await runPass('delete', false, logger)
  logger?.info(
    {
      checked: deleted.checked,
      orphaned: prepared.orphaned,
      rowsPrepared: prepared.rows,
      deleted: deleted.rows,
      failedBatches: prepared.failedBatches + deleted.failedBatches
    },
    'plausible site cleanup finished'
  )
}

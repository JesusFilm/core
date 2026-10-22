import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { Job } from 'bullmq'
import chunk from 'lodash/chunk'
import { Logger } from 'pino'

import { QrCode, prisma } from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'

import { env } from '../../../env'
import { logger as defaultLogger } from '../../../logger'
import { getTo } from '../../../schema/qrCode/qrCode.service'

// GraphQL queries for ShortLink operations
export const GET_SHORT_LINK = graphql(`
  query GetShortLink($id: String!) {
    shortLink(id: $id) {
      ... on NotFoundError {
        message
      }
      ... on QueryShortLinkSuccess {
        data {
          id
          pathname
          to
          domain {
            hostname
          }
        }
      }
    }
  }
`)

export const UPDATE_SHORT_LINK = graphql(`
  mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {
    shortLinkUpdate(input: $input) {
      ... on ZodError {
        message
      }
      ... on NotFoundError {
        message
      }
      ... on MutationShortLinkUpdateSuccess {
        data {
          id
          to
        }
      }
    }
  }
`)

// Create Apollo client for GraphQL operations
const createApolloClient = () => {
  const httpLink = new HttpLink({
    uri: env.GATEWAY_URL,
    headers: {
      'interop-token': env.INTEROP_TOKEN,
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': env.SERVICE_VERSION
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}

// Rows rewritten at once, so a sweep over every QR code cannot flood the
// Prisma pool shared with user requests or the gateway.
export const REWRITE_BATCH_SIZE = 10

/**
 * Points a short link at `to`. Returns `null` without a write when it already
 * points there.
 */
async function updateShortLinkIfChanged(
  id: string,
  to: string,
  logger?: Logger,
  apollo: ApolloClient = createApolloClient()
) {
  try {
    const { data: shortLinkData } = await apollo.query({
      query: GET_SHORT_LINK,
      variables: { id }
    })

    if (shortLinkData?.shortLink?.__typename === 'QueryShortLinkSuccess') {
      if (shortLinkData.shortLink.data.to === to) {
        return null
      }
    }

    const { data } = await apollo.mutate({
      mutation: UPDATE_SHORT_LINK,
      variables: {
        input: { id, to }
      }
    })

    if (
      data?.shortLinkUpdate?.__typename === 'ZodError' ||
      data?.shortLinkUpdate?.__typename === 'NotFoundError'
    ) {
      throw new Error(data?.shortLinkUpdate?.message ?? 'Unknown error')
    } else if (
      data?.shortLinkUpdate?.__typename === 'MutationShortLinkUpdateSuccess'
    ) {
      return data.shortLinkUpdate.data
    } else {
      throw new Error('Unexpected error occurred in short link update')
    }
  } catch (error) {
    logger?.error(
      `Failed to update shortlink ${id}: ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
  }
}

/**
 * Rewrites the short link of every given QR code to the target `getTo`
 * resolves. A row that fails is logged and skipped so the others still
 * rewrite; the next sweep repairs it. Rows are rewritten
 * `REWRITE_BATCH_SIZE` at a time over one shared Apollo client. Never throws.
 * Returns the number of rows whose short link was rewritten.
 */
export async function rewriteQrCodeShortLinks(
  qrCodes: QrCode[],
  logger: Logger = defaultLogger
): Promise<number> {
  const apollo = createApolloClient()
  let rewrittenCount = 0

  for (const batch of chunk(qrCodes, REWRITE_BATCH_SIZE)) {
    const results = await Promise.allSettled(
      batch.map(async (qrCode) => {
        const to = await getTo({
          shortLinkId: qrCode.shortLinkId,
          toJourneyId: qrCode.toJourneyId,
          toBlockId: qrCode.toBlockId
        })
        return await updateShortLinkIfChanged(
          qrCode.shortLinkId,
          to,
          logger,
          apollo
        )
      })
    )

    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled') {
        if (result.value != null) rewrittenCount++
        continue
      }
      logger.error(
        {
          qrCodeId: batch[index].id,
          shortLinkId: batch[index].shortLinkId,
          error: result.reason
        },
        'Failed to rewrite QR code short link'
      )
    }
  }
  return rewrittenCount
}

/**
 * Updates the shortlink of every QR code that points at the journey, the
 * journey's own and any campaign's. A row that fails is logged and left for
 * the next sweep, but it can still throw on its reads, so callers catch and
 * log it.
 */
export async function updateJourneyShortLink(
  journeyId: string,
  logger?: Logger
): Promise<void> {
  const qrCodes = await prisma.qrCode.findMany({
    where: { toJourneyId: journeyId }
  })

  if (qrCodes.length === 0) {
    logger?.info(`No QR codes found for journey ${journeyId}`)
    return
  }

  const rewrittenCount = await rewriteQrCodeShortLinks(qrCodes, logger)
  logger?.info(`Updated ${rewrittenCount} shortlinks for journey ${journeyId}`)
}

/**
 * Updates the shortlink of every QR code
 */
export async function updateAllShortlinks(logger?: Logger): Promise<number> {
  const qrCodes = await prisma.qrCode.findMany()

  logger?.info(`Found ${qrCodes.length} QR codes to check`)

  const updatedCount = await rewriteQrCodeShortLinks(qrCodes, logger)

  logger?.info(`Successfully updated ${updatedCount} shortlinks`)
  return updatedCount
}

export async function service(job: Job, logger?: Logger): Promise<void> {
  switch (job.data.__typename) {
    case 'updateAllShortlinks':
      await updateAllShortlinks(logger)
      break
  }
}

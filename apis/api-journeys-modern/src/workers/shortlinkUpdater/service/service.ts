import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma-journeys/client'
import { graphql } from '@core/shared/gql'

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
  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'interop-token': process.env.INTEROP_TOKEN ?? '',
      'x-graphql-client-name': 'api-journeys-modern',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
  })
}

/**
 * Builds the URL for a journey that will be used in shortlinks
 */
async function buildJourneyUrl(
  shortLinkId: string,
  journeyId: string,
  slug: string,
  blockId?: string | undefined
): Promise<string> {
  const journeysUrl = process.env.JOURNEYS_URL ?? ''
  if (journeysUrl === '') {
    throw new Error('JOURNEYS_URL not configured')
  }

  // Check if the journey's team has a custom domain
  const customDomain = await prisma.customDomain.findFirst({
    where: {
      team: {
        journeys: {
          some: {
            id: journeyId
          }
        }
      }
    }
  })

  const base =
    customDomain?.name != null ? `https://${customDomain.name}` : journeysUrl

  // Handle the blockId that might be undefined
  const blockPath = blockId ? `/${blockId}` : ''
  const path = `${slug}${blockPath}`
  const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

  return `${base}/${path}${utm}`
}

/**
 * Updates a shortlink with a new destination URL
 */
async function updateShortLink(id: string, to: string, logger?: Logger) {
  const apollo = createApolloClient()

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
 * Updates the shortlink for a specific journey
 */
export async function updateJourneyShortlink(
  journeyId: string,
  slug: string,
  logger?: Logger
): Promise<void> {
  // Find QR code for this journey
  const qrCode = await prisma.qrCode.findFirst({
    where: { toJourneyId: journeyId }
  })

  if (qrCode == null || qrCode.journeyId !== journeyId) {
    logger?.info(
      `No QR code found for journey ${journeyId} or QR code is for a different journey`
    )
    return
  }

  try {
    // Convert toBlockId to undefined if null to fix type issue
    const blockId = qrCode.toBlockId ?? undefined

    // Build the new URL for the shortlink
    const to = await buildJourneyUrl(
      qrCode.id,
      qrCode.toJourneyId,
      slug,
      blockId
    )

    // Update the shortlink
    await updateShortLink(qrCode.shortLinkId, to, logger)

    logger?.info(`Updated shortlink for journey: ${slug} (ID: ${journeyId})`)
  } catch (error) {
    logger?.error(
      `Error updating shortlink for journey ${journeyId}: ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
  }
}

/**
 * Updates all shortlinks for journeys with QR codes
 */
export async function updateAllShortlinks(logger?: Logger): Promise<number> {
  try {
    // Find all journeys that have QR codes with shortlinks
    const journeys = await prisma.journey.findMany({
      where: {
        qrCode: {
          some: {}
        }
      },
      include: {
        qrCode: true
      }
    })

    logger?.info(`Found ${journeys.length} journeys with QR codes to check`)

    // Track number of updates performed
    let updatedCount = 0

    // Process each journey
    for (const journey of journeys) {
      try {
        // Process each QR code for this journey
        for (const qrCode of journey.qrCode) {
          // Only update if the QR code is for this journey
          if (qrCode.journeyId === qrCode.toJourneyId) {
            // Convert toBlockId to undefined if null to fix type issue
            const blockId = qrCode.toBlockId ?? undefined

            // Build the new URL for the shortlink
            const to = await buildJourneyUrl(
              qrCode.id,
              qrCode.toJourneyId,
              journey.slug,
              blockId
            )

            // Update the shortlink
            const updatedShortLink = await updateShortLink(
              qrCode.shortLinkId,
              to,
              logger
            )

            if (updatedShortLink != null) {
              logger?.info(
                `Updated shortlink for journey: ${journey.slug} (ID: ${journey.id})`
              )
              updatedCount++
            }
          }
        }
      } catch (error) {
        // Log error but continue processing other journeys
        logger?.error(
          `Error updating shortlinks for journey ${journey.id}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }

    logger?.info(`Successfully updated ${updatedCount} shortlinks`)
    return updatedCount
  } catch (error) {
    logger?.error(
      `Error during shortlink check and update: ${error instanceof Error ? error.message : String(error)}`
    )
    throw error
  }
}

export async function service(job: Job, logger?: Logger): Promise<void> {
  switch (job.data.__typename) {
    case 'updateAllShortlinks':
      await updateAllShortlinks(logger)
      break
  }
}

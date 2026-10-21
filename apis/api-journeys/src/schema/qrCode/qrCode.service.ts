import { GraphQLError } from 'graphql'

import { JourneyStatus, Prisma, prisma } from '@core/prisma/journeys/client'

import { graphqlRequest } from '../../lib/gateway/graphqlRequest'
import {
  INCLUDE_JOURNEY_PUBLIC_URL,
  getJourneyPublicUrl
} from '../campaign/getJourneyPublicUrl'
import { badUserInput } from '../campaign/validation'

interface ShortLinkCreateInput {
  id: string
  hostname: string
  to: string
  service: string
}

interface ShortLinkUpdateInput {
  id: string
  to: string
}

const JOURNEYS_SHORTLINK_DOMAIN = process.env.JOURNEYS_SHORTLINK_DOMAIN

/**
 * Create a short link through the gateway. Returns its id and its public
 * address as api-media builds it (`https://<hostname>/<pathname>`, with the
 * domain's path prefix when it has one); `shortUrl` is null when api-media
 * returns no link.
 */
export async function createShortLink(
  input: ShortLinkCreateInput
): Promise<{ id: string; shortUrl: string | null }> {
  const query = `
    mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {
      shortLinkCreate(input: $input) {
        __typename
        ... on ZodError { message }
        ... on NotUniqueError { message }
        ... on MutationShortLinkCreateSuccess {
          data { id shortUrl }
        }
      }
    }
  `

  const data = await graphqlRequest(query, { input })
  const result = data.shortLinkCreate as {
    __typename?: string
    message?: string
    data?: { id: string; shortUrl: string }
  }

  if (
    result.__typename === 'ZodError' ||
    result.__typename === 'NotUniqueError'
  )
    throw new GraphQLError(result.message ?? 'Short link creation failed', {
      extensions: { code: 'BAD_USER_INPUT' }
    })

  return {
    id: result.data?.id ?? input.id,
    shortUrl: result.data?.shortUrl ?? null
  }
}

export async function updateShortLink(
  input: ShortLinkUpdateInput
): Promise<void> {
  const query = `
    mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {
      shortLinkUpdate(input: $input) {
        __typename
        ... on ZodError { message }
        ... on NotFoundError { message }
        ... on MutationShortLinkUpdateSuccess {
          data { id to }
        }
      }
    }
  `

  const data = await graphqlRequest(query, { input })
  const result = data.shortLinkUpdate as {
    __typename?: string
    message?: string
  }

  if (result.__typename === 'ZodError' || result.__typename === 'NotFoundError')
    throw new GraphQLError(result.message ?? 'Short link update failed', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
}

export async function deleteShortLink(id: string): Promise<void> {
  const query = `
    mutation shortLinkDelete($id: String!) {
      shortLinkDelete(id: $id) {
        __typename
        ... on NotFoundError { message }
        ... on MutationShortLinkDeleteSuccess {
          data { id }
        }
      }
    }
  `

  await graphqlRequest(query, { id })
}

/**
 * The short-link target: the journey's public address, decided by the
 * target journey's own team (a route-all custom domain, else a collection
 * domain containing it, else the root domain), plus the block path and the
 * QR attribution parameters. The QR row's own team no longer decides the
 * domain, so a campaign QR code pointing at another team's journey lands
 * where that team serves it; for a QR whose team owns the journey the
 * result is unchanged. Reads through `tx` when the caller has one open.
 */
export async function getTo(
  {
    shortLinkId,
    toJourneyId,
    toBlockId
  }: {
    shortLinkId: string
    toJourneyId: string
    toBlockId?: string | null
  },
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const journey = await tx.journey.findUniqueOrThrow({
    where: { id: toJourneyId },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })

  const block =
    toBlockId != null
      ? await tx.block.findUniqueOrThrow({
          where: { journeyId: journey.id, id: toBlockId }
        })
      : null

  const url = getJourneyPublicUrl(journey)
  const path = block != null ? `/${block.id}` : ''
  const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

  return `${url}${path}${utm}`
}

/**
 * Resolve a pasted address to its journey and block. The address must be on
 * the host that serves the target journey, decided by the journey's own team
 * exactly as `getTo` does, so a campaign QR code can be repointed at another
 * team's journey with that journey's own URL. The journey must be published
 * and not trashed or deleted; a journey of the QR code's own team may also be
 * a draft or archived.
 */
export async function parseAndVerifyTo(
  to: string,
  teamId: string
): Promise<{ toJourneyId: string; toBlockId?: string | null }> {
  let url: URL
  try {
    url = new URL(to)
  } catch {
    throw badUserInput('to must be a URL', 'to')
  }
  const { origin, pathname } = url

  const pathArray = pathname.split('/')
  const journeySlug = pathArray[1]
  const blockId = pathArray[2]

  if (journeySlug == null || journeySlug === '')
    throw badUserInput('Invalid to', 'to')

  const journey = await prisma.journey.findFirst({
    where: {
      slug: journeySlug,
      deletedAt: null,
      trashedAt: null,
      OR: [{ status: JourneyStatus.published }, { teamId }]
    },
    include: INCLUDE_JOURNEY_PUBLIC_URL
  })

  if (journey == null)
    throw badUserInput(
      'to does not name a journey this QR code can point at',
      'to'
    )

  if (new URL(getJourneyPublicUrl(journey)).origin !== origin)
    throw badUserInput('Invalid hostname', 'to')

  const block =
    blockId != null
      ? await prisma.block.findFirst({
          where: { journeyId: journey.id, id: blockId }
        })
      : undefined

  if (blockId != null && block == null)
    throw badUserInput('to names a block that is not in that journey', 'to')

  return {
    toJourneyId: journey.id,
    toBlockId: block?.id ?? undefined
  }
}

export function getShortLinkDomain(): string {
  if (JOURNEYS_SHORTLINK_DOMAIN == null)
    throw new GraphQLError('Shortlink domain not added', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  return JOURNEYS_SHORTLINK_DOMAIN
}

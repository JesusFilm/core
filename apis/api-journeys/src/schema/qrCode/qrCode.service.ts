import { GraphQLError } from 'graphql'

import { QrCode, prisma } from '@core/prisma/journeys/client'

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

const GATEWAY_URL = process.env.GATEWAY_URL
const INTEROP_TOKEN = process.env.INTEROP_TOKEN ?? ''
const JOURNEYS_URL = process.env.JOURNEYS_URL
const JOURNEYS_SHORTLINK_DOMAIN = process.env.JOURNEYS_SHORTLINK_DOMAIN

async function graphqlRequest(
  query: string,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  if (GATEWAY_URL == null)
    throw new GraphQLError('Gateway URL not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'interop-token': INTEROP_TOKEN,
      'x-graphql-client-name': 'api-journeys',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    },
    body: JSON.stringify({ query, variables })
  })

  const result = (await response.json()) as {
    data?: Record<string, unknown>
    errors?: Array<{ message: string }>
  }

  if (result.errors != null && result.errors.length > 0)
    throw new GraphQLError(result.errors[0].message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  return result.data ?? {}
}

export async function createShortLink(
  input: ShortLinkCreateInput
): Promise<{ id: string }> {
  const query = `
    mutation shortLinkCreate($input: MutationShortLinkCreateInput!) {
      shortLinkCreate(input: $input) {
        ... on ZodError { message }
        ... on NotUniqueError { message }
        ... on MutationShortLinkCreateSuccess {
          data { id pathname to domain { hostname } }
        }
      }
    }
  `

  const data = await graphqlRequest(query, { input })
  const result = data.shortLinkCreate as {
    __typename?: string
    message?: string
    data?: { id: string }
  }

  if (
    result.__typename === 'ZodError' ||
    result.__typename === 'NotUniqueError'
  )
    throw new GraphQLError(result.message ?? 'Short link creation failed', {
      extensions: { code: 'BAD_USER_INPUT' }
    })

  return { id: result.data?.id ?? input.id }
}

export async function updateShortLink(
  input: ShortLinkUpdateInput
): Promise<void> {
  const query = `
    mutation shortLinkUpdate($input: MutationShortLinkUpdateInput!) {
      shortLinkUpdate(input: $input) {
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
        ... on NotFoundError { message }
        ... on MutationShortLinkDeleteSuccess {
          data { id }
        }
      }
    }
  `

  await graphqlRequest(query, { id })
}

export async function getTo({
  shortLinkId,
  teamId,
  toJourneyId,
  toBlockId
}: {
  shortLinkId: string
  teamId: string
  toJourneyId: string
  toBlockId?: string | null
}): Promise<string> {
  if (JOURNEYS_URL == null)
    throw new GraphQLError('Journeys url not added', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: toJourneyId }
  })

  const customDomain = (
    await prisma.customDomain.findMany({ where: { teamId } })
  )[0]

  const block =
    toBlockId != null
      ? await prisma.block.findUniqueOrThrow({
          where: { journeyId: journey.id, id: toBlockId }
        })
      : null

  const base =
    customDomain?.name != null ? `https://${customDomain.name}` : JOURNEYS_URL

  const path = `${journey.slug}${block != null ? `/${block.id}` : ''}`
  const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

  return `${base}/${path}${utm}`
}

export async function parseAndVerifyTo(
  qrCode: QrCode,
  to: string
): Promise<{ toJourneyId: string; toBlockId?: string | null }> {
  const { origin, hostname, pathname } = new URL(to)

  const pathArray = pathname.split('/')
  const journeySlug = pathArray[1]
  const blockId = pathArray[2]

  if (hostname == null || journeySlug == null)
    throw new GraphQLError('Invalid to', {
      extensions: { code: 'BAD_USER_INPUT' }
    })

  const customDomain = (
    await prisma.customDomain.findMany({ where: { teamId: qrCode.teamId } })
  )[0]

  if (
    customDomain != null &&
    customDomain.name != null &&
    customDomain.name !== hostname
  ) {
    throw new GraphQLError('Invalid hostname', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  } else if (origin !== JOURNEYS_URL) {
    throw new GraphQLError('Invalid hostname', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  const journey = await prisma.journey.findFirstOrThrow({
    where: { slug: journeySlug }
  })

  const block =
    blockId != null
      ? await prisma.block.findFirstOrThrow({
          where: { journeyId: journey.id, id: blockId }
        })
      : undefined

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

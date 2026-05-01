import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'

const DOMAIN_REGEX =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z]$/

interface VercelCreateDomainResponse {
  name: string
  apexName: string
}

interface VercelCreateDomainError {
  error: {
    code: string
    message: string
  }
}

interface VercelConfigDomainResponse {
  configuredBy: string | null
  nameservers: string[]
  serviceType: string
  cnames: string[]
  aValues: string[]
  conflicts: string[]
  acceptedChallenges: string[]
  misconfigured: boolean
}

interface VercelDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect: null
  redirectStatusCode: null
  gitBranch: null
  updatedAt: number
  createdAt: number
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
}

interface VercelVerifyDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect: null
  redirectStatusCode: null
  gitBranch: null
  updatedAt: number
  createdAt: number
  verified: boolean
}

interface VercelVerifyDomainError {
  error: {
    code: string
    message: string
  }
}

export interface CustomDomainCheckResult {
  configured: boolean
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }> | null
  verificationResponse?: {
    code: string
    message: string
  } | null
}

export function isDomainValid(domain: string): boolean {
  return DOMAIN_REGEX.test(domain)
}

export async function createVercelDomain(
  name: string
): Promise<VercelCreateDomainResponse> {
  if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
    return { name, apexName: name }

  const response = await fetch(
    `https://api.vercel.com/v10/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      body: JSON.stringify({ name }),
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      },
      method: 'POST'
    }
  )

  const data: VercelCreateDomainResponse | VercelCreateDomainError =
    await response.json()

  if ('error' in data) {
    switch (response.status) {
      case 400:
        throw new GraphQLError(data.error.message, {
          extensions: { code: 'BAD_USER_INPUT', vercelCode: data.error.code }
        })
      case 409:
        throw new GraphQLError(data.error.message, {
          extensions: { code: 'CONFLICT', vercelCode: data.error.code }
        })
      default:
        throw new GraphQLError('vercel response not handled', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
    }
  }
  return data
}

export async function deleteVercelDomain(name: string): Promise<boolean> {
  if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null) return true

  const response = await fetch(
    `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      },
      method: 'DELETE'
    }
  )

  switch (response.status) {
    case 200:
    case 404:
      return true
    default:
      throw new GraphQLError('vercel response not handled', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
  }
}

const UPDATE_SHORT_LINK = graphql(`
  mutation shortLinkUpdateForCustomDomain(
    $input: MutationShortLinkUpdateInput!
  ) {
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

function createGatewayClient(): ApolloClient<unknown> {
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

async function buildShortLinkTo(
  shortLinkId: string,
  toJourneyId: string,
  toBlockId: string | null,
  customDomainName: string
): Promise<string> {
  const journeysUrl = process.env.JOURNEYS_URL
  if (journeysUrl == null)
    throw new GraphQLError('Journeys url not configured', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: toJourneyId }
  })

  const base = `https://${customDomainName}`
  const blockPath = toBlockId != null ? `/${toBlockId}` : ''
  const path = `${journey.slug}${blockPath}`
  const utm = `?utm_source=ns-qr-code&utm_campaign=${shortLinkId}`

  return `${base}/${path}${utm}`
}

export async function updateTeamShortLinks(
  teamId: string,
  customDomainName: string
): Promise<void> {
  const apollo = createGatewayClient()

  const qrCodes = await prisma.qrCode.findMany({
    where: { teamId }
  })

  for (const qrCode of qrCodes) {
    if (qrCode.journeyId !== qrCode.toJourneyId) continue

    const to = await buildShortLinkTo(
      qrCode.id,
      qrCode.toJourneyId,
      qrCode.toBlockId,
      customDomainName
    )

    await apollo.mutate({
      mutation: UPDATE_SHORT_LINK,
      variables: {
        input: { id: qrCode.shortLinkId, to }
      }
    })
  }
}

export async function checkVercelDomain(
  name: string
): Promise<CustomDomainCheckResult> {
  if (process.env.VERCEL_JOURNEYS_PROJECT_ID == null)
    return { configured: true, verified: true }

  const [configResponse, domainResponse] = await Promise.all([
    fetch(
      `https://api.vercel.com/v6/domains/${name}/config?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
        method: 'GET'
      }
    ),
    fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
        method: 'GET'
      }
    )
  ])

  if (domainResponse.status !== 200)
    throw new GraphQLError('vercel domain response not handled', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  if (configResponse.status !== 200)
    throw new GraphQLError('vercel config response not handled', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })

  const configData: VercelConfigDomainResponse = await configResponse.json()
  const domainData: VercelDomainResponse = await domainResponse.json()

  let verifyData: VercelVerifyDomainResponse | VercelVerifyDomainError | null =
    null

  if (!domainData.verified) {
    const verifyResponse = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_JOURNEYS_PROJECT_ID}/domains/${name}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
      {
        headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
        method: 'POST'
      }
    )

    verifyData = await verifyResponse.json()

    if (
      verifyResponse.status !== 200 &&
      (verifyData == null ||
        ('error' in verifyData &&
          !['existing_project_domain', 'missing_txt_record'].includes(
            verifyData.error.code
          )))
    )
      throw new GraphQLError('vercel verification response not handled', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
  }

  if (verifyData != null && 'verified' in verifyData && verifyData.verified)
    return { configured: !configData.misconfigured, verified: true }

  return {
    configured: !configData.misconfigured,
    verified: domainData.verified,
    verification: domainData.verification ?? null,
    verificationResponse:
      verifyData != null && 'error' in verifyData ? verifyData.error : null
  }
}

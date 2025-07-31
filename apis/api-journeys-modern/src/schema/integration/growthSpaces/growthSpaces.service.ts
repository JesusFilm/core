import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'
import axios, { AxiosError, AxiosInstance } from 'axios'
import { GraphQLError } from 'graphql/error'

import { Block, Integration, Prisma } from '.prisma/api-journeys-modern-client'
import { decryptSymmetric, encryptSymmetric } from '@core/nest/common/crypto'

import { prisma } from '../../../lib/prisma'

// Types will be defined locally since we don't have generated GraphQL types yet
interface GetLanguagesQuery {
  language?: {
    bcp47: string
    id: string
  }
}

interface GetLanguagesQueryVariables {
  languageId: string
}

interface IntegrationGrowthSpacesCreateInput {
  accessId: string
  accessSecret: string
  teamId: string
}

interface IntegrationGrowthSpacesUpdateInput {
  accessId: string
  accessSecret: string
}

interface IntegrationGrowthSpacesRoute {
  id: string
  name: string
}

enum IntegrationType {
  growthSpaces = 'growthSpaces'
}

const ONE_DAY_MS = 86400000

const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID!) {
    language(id: $languageId) {
      bcp47
      id
    }
  }
`

// Simple in-memory cache replacement for NestJS cache manager
const cache = new Map<string, { value: any; expiry: number }>()

const cacheManager = {
  async get<T>(key: string): Promise<T | undefined> {
    const item = cache.get(key)
    if (item && item.expiry > Date.now()) {
      return item.value as T
    }
    cache.delete(key)
    return undefined
  },
  async set(key: string, value: any, ttl: number): Promise<void> {
    cache.set(key, {
      value,
      expiry: Date.now() + ttl
    })
  }
}

export async function getAPIClient(
  integration: Integration | { accessId: string; accessSecret: string }
): Promise<AxiosInstance> {
  let accessSecret: string | undefined =
    'accessSecret' in integration ? integration.accessSecret : undefined

  if (
    'accessSecretCipherText' in integration &&
    integration.accessSecretCipherText != null &&
    integration.accessSecretIv != null &&
    integration.accessSecretTag != null
  )
    accessSecret = await decryptSymmetric(
      integration.accessSecretCipherText,
      integration.accessSecretIv,
      integration.accessSecretTag,
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
    )

  return axios.create({
    baseURL: process.env.GROWTH_SPACES_URL,
    headers: {
      'Access-Id': integration.accessId,
      'Access-Secret': accessSecret
    }
  })
}

export async function authenticate(input: {
  accessId: string
  accessSecret: string
}): Promise<void> {
  const client = await getAPIClient(input)
  try {
    await client.get('/authentication')
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401)
      throw new GraphQLError(
        'invalid credentials for Growth Spaces integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new GraphQLError((e as Error).message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
}

export async function addSubscriber(
  journeyId: string,
  block: Block,
  name: string | null,
  email: string
): Promise<void> {
  if (block.integrationId == null || block.routeId == null) return

  const integration = await prisma.integration.findUnique({
    where: { id: block.integrationId }
  })

  if (integration == null) return

  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: { languageId: true }
  })

  if (journey == null) return

  const key = `language-${journey.languageId}`
  let languageCode = await cacheManager.get<string>(key)
  if (languageCode == null) {
    const httpLink = createHttpLink({
      uri: process.env.GATEWAY_URL,
      headers: {
        'interop-token': process.env.INTEROP_TOKEN ?? '',
        'x-graphql-client-name': 'api-journeys-modern',
        'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
      }
    })
    const apollo = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    const { data } = await apollo.query<
      GetLanguagesQuery,
      GetLanguagesQueryVariables
    >({
      query: GET_LANGUAGES,
      variables: { languageId: journey?.languageId }
    })
    if (data?.language?.bcp47 == null) {
      console.error('cannot find language code')
      return
    }

    languageCode = data.language.bcp47
    await cacheManager.set(key, languageCode, ONE_DAY_MS)
  }
  try {
    const client = await getAPIClient(integration)
    await client.post('/subscribers', {
      subscriber: {
        route_id: block.routeId,
        language_code: languageCode,
        email,
        first_name: name
      }
    })
  } catch (e) {
    // do not return any errors so that it does not interrupt text response event create
    // console.error so it shows up in data dog
    console.error((e as Error).message)
  }
}

export async function routes(
  integration: Integration
): Promise<IntegrationGrowthSpacesRoute[]> {
  const client = await getAPIClient(integration)
  try {
    const res = await client.get('/routes')
    return res.data
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401)
      throw new GraphQLError(
        'invalid credentials for Growth Spaces integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    throw new GraphQLError((e as Error).message, {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  }
}

export async function create(
  input: IntegrationGrowthSpacesCreateInput,
  tx: Prisma.TransactionClient
): Promise<Integration> {
  await authenticate(input)

  const { ciphertext, iv, tag } = await encryptSymmetric(
    input.accessSecret,
    process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
  )

  return await tx.integration.create({
    data: {
      type: IntegrationType.growthSpaces,
      teamId: input.teamId,
      accessId: input.accessId,
      accessSecretPart: input.accessSecret.slice(0, 6),
      accessSecretCipherText: ciphertext,
      accessSecretIv: iv,
      accessSecretTag: tag
    },
    include: { team: { include: { userTeams: true } } }
  })
}

export async function update(
  id: string,
  input: IntegrationGrowthSpacesUpdateInput
): Promise<Integration> {
  await authenticate(input)
  const { ciphertext, iv, tag } = await encryptSymmetric(
    input.accessSecret,
    process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
  )
  return await prisma.integration.update({
    where: { id },
    data: {
      accessId: input.accessId,
      accessSecretPart: input.accessSecret.slice(0, 6),
      accessSecretCipherText: ciphertext,
      accessSecretIv: iv,
      accessSecretTag: tag
    }
  })
}

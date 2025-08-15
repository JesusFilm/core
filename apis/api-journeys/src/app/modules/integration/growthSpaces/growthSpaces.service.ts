import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  gql
} from '@apollo/client'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import axios, { AxiosError, AxiosInstance } from 'axios'
import { Cache } from 'cache-manager'
import { GraphQLError } from 'graphql/error'

import { decryptSymmetric, encryptSymmetric } from '@core/nest/common/crypto'
import { Block, Integration, Prisma } from '@core/prisma/journeys/client'

import {
  GetLanguagesQuery,
  GetLanguagesQueryVariables
} from '../../../../__generated__/graphql'
import {
  IntegrationGrowthSpacesCreateInput,
  IntegrationGrowthSpacesRoute,
  IntegrationGrowthSpacesUpdateInput,
  IntegrationType
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

const ONE_DAY_MS = 86400000

const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID!) {
    language(id: $languageId) {
      bcp47
      id
    }
  }
`

@Injectable()
export class IntegrationGrowthSpacesService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getAPIClient(
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

  async authenticate(input: {
    accessId: string
    accessSecret: string
  }): Promise<void> {
    const client = await this.getAPIClient(input)
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
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  async addSubscriber(
    journeyId: string,
    block: Block,
    name: string | null,
    email: string
  ): Promise<void> {
    if (block.integrationId == null || block.routeId == null) return

    const integration = await this.prismaService.integration.findUnique({
      where: { id: block.integrationId }
    })

    if (integration == null) return

    const journey = await this.prismaService.journey.findUnique({
      where: { id: journeyId },
      select: { languageId: true }
    })

    if (journey == null) return

    const key = `language-${journey.languageId}`
    let languageCode = await this.cacheManager.get<string>(key)
    if (languageCode == null) {
      const httpLink = createHttpLink({
        uri: process.env.GATEWAY_URL,
        headers: {
          'x-graphql-client-name': 'api-journeys',
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
      await this.cacheManager.set(key, languageCode, ONE_DAY_MS)
    }
    try {
      const client = await this.getAPIClient(integration)
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
      console.error(e.message)
    }
  }

  async routes(
    integration: Integration
  ): Promise<IntegrationGrowthSpacesRoute[]> {
    const client = await this.getAPIClient(integration)
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
      throw new GraphQLError(e.message, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }
  }

  async create(
    input: IntegrationGrowthSpacesCreateInput,
    tx: Prisma.TransactionClient
  ): Promise<Integration> {
    await this.authenticate(input)

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

  async update(
    id: string,
    input: IntegrationGrowthSpacesUpdateInput
  ): Promise<Integration> {
    await this.authenticate(input)
    const { ciphertext, iv, tag } = await encryptSymmetric(
      input.accessSecret,
      process.env.INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET
    )
    return await this.prismaService.integration.update({
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
}

import { CacheModule } from '@nestjs/cache-manager'
import { Test } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { IntegrationType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { IntegrationResolver } from './integration.resolver'
import { Integration } from '.prisma/api-journeys-client'

describe('IntegrationResolver', () => {
  let resolver: IntegrationResolver, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [
        IntegrationResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() }
      ]
    }).compile()

    resolver = module.get<IntegrationResolver>(IntegrationResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  const integration: Integration = {
    id: 'integrationId',
    teamId: 'teamId',
    type: 'growthSpaces',
    accessId: 'accessId',
    // decrypted value for accessSecretCipherText should be "plaintext"
    accessSecretCipherText: 'saeRCBy44pMT',
    accessSecretIv: 'dx+2iBr7yYvilLIC',
    accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA=='
  }

  describe('__resolveType', () => {
    it('should return __typename for IntegrationGrowthSpace', async () => {
      const res = await resolver.__resolveType({
        ...integration,
        type: IntegrationType.growthSpaces
      })
      expect(res).toBe('IntegrationGrowthSpaces')
    })
  })

  describe('integrations', () => {
    it('should return all integrations for team', async () => {
      prismaService.integration.findMany.mockResolvedValue([])
      await resolver.integrations('teamId')
      expect(prismaService.integration.findMany).toHaveBeenCalledWith({
        where: {
          teamId: 'teamId'
        }
      })
    })
  })

  describe('integrationDelete', () => {
    it('should delete integration', async () => {
      prismaService.integration.delete.mockResolvedValue(integration)
      await resolver.integrationDelete({
        id: 'integrationId',
        teamId: 'teamId'
      })
      expect(prismaService.integration.delete).toHaveBeenCalledWith({
        where: {
          id: 'integrationId'
        }
      })
    })
  })
})

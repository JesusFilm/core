import { CacheModule } from '@nestjs/cache-manager'
import { Test } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Integration, Prisma } from '@core/prisma/journeys/client'

import { IntegrationType, UserTeamRole } from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { IntegrationResolver } from './integration.resolver'

describe('IntegrationResolver', () => {
  let resolver: IntegrationResolver,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        CaslAuthModule.register(AppCaslFactory)
      ],
      providers: [
        IntegrationResolver,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() }
      ]
    }).compile()

    resolver = module.get<IntegrationResolver>(IntegrationResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  const integration: Integration = {
    id: 'integrationId',
    teamId: 'teamId',
    type: 'growthSpaces',
    accessId: 'accessId',
    // decrypted value for accessSecretCipherText should be "plaintext"
    accessSecretCipherText: 'saeRCBy44pMT',
    accessSecretIv: 'dx+2iBr7yYvilLIC',
    accessSecretTag: 'VondZ4B9TbgdwCQeqjnkfA==',
    team: {
      id: 'teamId',
      userTeams: [{ userId: 'userId', role: UserTeamRole.manager }]
    }
  } as unknown as Integration

  const accessibleIntegrations: Prisma.IntegrationWhereInput = {
    team: {
      is: {
        userTeams: {
          some: {
            userId: 'userId',
            role: { in: [UserTeamRole.manager, UserTeamRole.member] }
          }
        }
      }
    }
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
      await resolver.integrations('teamId', accessibleIntegrations)
      expect(prismaService.integration.findMany).toHaveBeenCalledWith({
        where: {
          AND: [accessibleIntegrations, { teamId: 'teamId' }]
        }
      })
    })
  })

  describe('integrationDelete', () => {
    it('should delete integration', async () => {
      prismaService.integration.delete.mockResolvedValue(integration)
      prismaService.integration.findUnique.mockResolvedValue(integration)
      await resolver.integrationDelete('integrationId', ability)
      expect(prismaService.integration.delete).toHaveBeenCalledWith({
        where: {
          id: 'integrationId'
        }
      })
    })

    it('should throw error if integration not found', async () => {
      await expect(
        resolver.integrationDelete('integrationId', ability)
      ).rejects.toThrow('integration not found')
    })

    it('should throw error if user not authorized to delete integration', async () => {
      prismaService.integration.findUnique.mockResolvedValue({
        ...integration,
        team: {
          id: 'teamId',
          userTeams: [
            { userId: 'different user Id', role: UserTeamRole.manager }
          ]
        }
      } as unknown as Integration)
      await expect(
        resolver.integrationDelete('integrationId', ability)
      ).rejects.toThrow('user is not allowed to delete integration')
    })
  })
})

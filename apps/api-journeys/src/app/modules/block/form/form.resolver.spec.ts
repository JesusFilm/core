import { FormiumClient, createClient } from '@formium/client'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Block, Journey, UserTeamRole } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  FormBlockCreateInput,
  FormBlockUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { FormBlockResolver } from './form.resolver'

jest.mock('@formium/client', () => ({
  __esModule: true,
  createClient: jest.fn()
}))
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

describe('FormBlock', () => {
  let resolver: FormBlockResolver,
    service: BlockService,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: 'blockId',
    journeyId: 'journeyId',
    typename: 'FormBlock',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    projectId: 'projectId',
    formSlug: 'formSlug',
    apiToken: 'apiToken'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: FormBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId'
  }
  const blockUpdateInput: FormBlockUpdateInput = {
    projectId: 'projectId',
    formSlug: 'formSlug',
    apiToken: 'apiToken'
  }
  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      getSiblings: jest.fn(() => [block, block]),
      update: jest.fn((input) => input),
      validateBlock: jest.fn()
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        blockService,
        FormBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<FormBlockResolver>(FormBlockResolver)
    service = module.get<BlockService>(BlockService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('formBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates a FormBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)

      expect(await resolver.formBlockCreate(ability, blockCreateInput)).toEqual(
        blockWithUserTeam
      )
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          typename: 'FormBlock',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })
      expect(service.getSiblings).toHaveBeenCalledWith(
        blockCreateInput.journeyId,
        blockCreateInput.parentBlockId
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.formBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })
  })

  describe('formBlockUpdate', () => {
    let mockValidate: jest.MockedFunction<typeof service.validateBlock>

    beforeEach(() => {
      mockValidate = service.validateBlock as jest.MockedFunction<
        typeof service.validateBlock
      >
      mockValidate.mockResolvedValue(true)
    })

    it('updates a FormBlock', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn(() => ({
          data: [{ id: 'projectId', name: 'projectName' }]
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.formBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', blockUpdateInput)
    })

    it('throws error if block not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.formBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if user not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.formBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })

    it('throws error if token is invalid', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn().mockRejectedValueOnce(new Error('error'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await expect(
        resolver.formBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('invalid token value')
    })

    it('throws error is project id is invalid', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn(() => ({
          data: [{ id: 'invalid-projectId', name: 'projectName' }]
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await expect(
        resolver.formBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('invalid project id')
    })
  })

  describe('form', () => {
    it('returns formium form', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest.fn()
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      await resolver.form({
        ...block
      })

      expect(mockFormiumClient.getFormBySlug).toHaveBeenCalledWith(
        block.formSlug
      )
    })

    it('returns null if client fails to fetch form', async () => {
      const mockFormiumClient = {
        getFormBySlug: jest.fn().mockRejectedValueOnce(new Error('error'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      expect(
        await resolver.form({
          ...block
        })
      ).toBeNull()
    })

    it('returns null if there are missing credentials', async () => {
      expect(
        await resolver.form({
          ...block,
          projectId: null,
          formSlug: null,
          apiToken: null
        })
      ).toBeNull()
    })
  })

  describe('projects', () => {
    it('returns projects', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn(() => ({
          data: [{ id: 'projectId', name: 'projectName' }]
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      expect(
        await resolver.projects({
          ...block
        })
      ).toEqual([{ id: 'projectId', name: 'projectName' }])
      expect(mockFormiumClient.getMyProjects).toHaveBeenCalled()
    })

    it('returns empty array if client fails to fetch projects', async () => {
      const mockFormiumClient = {
        getMyProjects: jest.fn().mockRejectedValueOnce(new Error('error'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      expect(
        await resolver.projects({
          ...block
        })
      ).toEqual([])
    })

    it('returns empty array if there are missing credentials', async () => {
      expect(
        await resolver.projects({
          ...block,
          apiToken: null
        })
      ).toEqual([])
    })
  })

  describe('forms', () => {
    it('returns forms', async () => {
      const mockFormiumClient = {
        findForms: jest.fn(() => ({
          data: [{ slug: 'form-slug', name: 'form name' }]
        }))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      expect(
        await resolver.forms({
          ...block
        })
      ).toEqual([{ slug: 'form-slug', name: 'form name' }])
      expect(mockFormiumClient.findForms).toHaveBeenCalled()
    })

    it('returns empty array if client fails to fetch forms', async () => {
      const mockFormiumClient = {
        findForms: jest.fn().mockRejectedValueOnce(new Error('error'))
      } as unknown as FormiumClient
      mockCreateClient.mockReturnValueOnce(mockFormiumClient)

      expect(
        await resolver.forms({
          ...block
        })
      ).toEqual([])
    })

    it('returns empty array if there are missing credentials', async () => {
      expect(
        await resolver.forms({
          ...block,
          projectId: null,
          apiToken: null
        })
      ).toEqual([])
    })
  })
})

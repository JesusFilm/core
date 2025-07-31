import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { Block, Journey, UserTeamRole } from '@core/prisma/journeys/client'

import {
  ImageBlockCreateInput,
  ImageBlockUpdateInput
} from '../../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../../lib/casl/caslFactory'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../block.service'

import { ImageBlockResolver } from './image.resolver'

jest.mock('./transformInput', () => {
  return {
    transformInput: jest.fn((input) => ({
      ...input,
      width: 640,
      height: 425,
      blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
    }))
  }
})

describe('ImageBlockResolver', () => {
  let resolver: ImageBlockResolver,
    service: DeepMockProxy<BlockService>,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const journey = {
    team: { userTeams: [{ userId: 'userId', role: UserTeamRole.manager }] }
  } as unknown as Journey
  const block = {
    id: '1',
    journeyId: 'journeyId',
    typename: 'ImageBlock',
    parentOrder: 2,
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'grid image',
    width: 640,
    height: 425,
    blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
    updatedAt: '2024-10-21T04:32:25.858Z'
  } as unknown as Block
  const blockWithUserTeam = {
    ...block,
    journey
  }
  const blockCreateInput: ImageBlockCreateInput = {
    id: 'blockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'grid image'
  }
  const blockUpdateInput: ImageBlockUpdateInput = {
    parentBlockId: 'parentBlockId',
    src: 'https://unsplash.it/640/425?image=42',
    alt: 'grid image',
    focalTop: 20,
    focalLeft: 20
  }
  const parentBlock = {
    id: 'parentBlockId',
    journeyId: 'journeyId',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    coverBlockId: 'coverBlockId',
    fullscreen: true
  } as unknown as Block

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        {
          provide: BlockService,
          useValue: mockDeep<BlockService>()
        },
        ImageBlockResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<ImageBlockResolver>(ImageBlockResolver)
    service = module.get<BlockService>(
      BlockService
    ) as DeepMockProxy<BlockService>
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
    service.getSiblings.mockResolvedValue([
      { ...block, action: null },
      { ...block, action: null }
    ])
  })

  describe('imageBlockCreate', () => {
    beforeEach(() => {
      prismaService.$transaction.mockImplementation(
        async (callback) => await callback(prismaService)
      )
    })

    it('creates an ImageBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.imageBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          alt: 'grid image',
          blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
          coverBlockParent: undefined,
          height: 425,
          src: 'https://unsplash.it/640/425?image=42',
          typename: 'ImageBlock',
          width: 640
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

    it('should set journey updatedAt when image is created', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.imageBlockCreate(ability, blockCreateInput)
      ).toEqual(blockWithUserTeam)
      expect(service.setJourneyUpdatedAt).toHaveBeenCalledWith(
        prismaService,
        blockWithUserTeam
      )
    })

    it('creates an ImageBlock with a focal point', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.imageBlockCreate(ability, {
          ...blockCreateInput,
          focalTop: 50,
          focalLeft: 50
        })
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: 2,
          alt: 'grid image',
          blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
          coverBlockParent: undefined,
          height: 425,
          src: 'https://unsplash.it/640/425?image=42',
          typename: 'ImageBlock',
          width: 640,
          focalTop: 50,
          focalLeft: 50
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

    it('creates an ImageBlock without parent block', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      expect(
        await resolver.imageBlockCreate(ability, {
          ...blockCreateInput,
          parentBlockId: null
        })
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: undefined,
          parentOrder: 2,
          alt: 'grid image',
          blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
          coverBlockParent: undefined,
          height: 425,
          src: 'https://unsplash.it/640/425?image=42',
          typename: 'ImageBlock',
          width: 640
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
    })

    it('creates a cover ImageBlock', async () => {
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      prismaService.block.findUnique.mockResolvedValueOnce(parentBlock)
      expect(
        await resolver.imageBlockCreate(ability, {
          ...blockCreateInput,
          isCover: true
        })
      ).toEqual(blockWithUserTeam)
      expect(prismaService.block.create).toHaveBeenCalledWith({
        data: {
          id: 'blockId',
          journey: { connect: { id: 'journeyId' } },
          parentBlock: { connect: { id: 'parentBlockId' } },
          parentOrder: null,
          alt: 'grid image',
          blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ',
          coverBlockParent: { connect: { id: 'parentBlockId' } },
          height: 425,
          src: 'https://unsplash.it/640/425?image=42',
          typename: 'ImageBlock',
          width: 640
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
    })

    it('throws error if not authorized', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.imageBlockCreate(ability, blockCreateInput)
      ).rejects.toThrow('user is not allowed to create block')
    })

    it('throws error if no parentBlockId for cover block', async () => {
      prismaService.block.create.mockResolvedValueOnce(block)
      await expect(
        resolver.imageBlockCreate(ability, {
          ...blockCreateInput,
          isCover: true,
          parentBlockId: null
        })
      ).rejects.toThrow('parent block id is required for cover blocks')
    })

    it('throws error if no parent block found for cover block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.imageBlockCreate(ability, {
          ...blockCreateInput,
          isCover: true
        })
      ).rejects.toThrow('parent block not found')
    })

    it('removes old cover block', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce({
        ...parentBlock,
        coverBlock: block
      } as unknown as Block)
      prismaService.block.create.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.imageBlockCreate(ability, {
        ...blockCreateInput,
        isCover: true
      })
      expect(service.removeBlockAndChildren).toHaveBeenCalledWith(block)
    })
  })

  describe('imageBlockUpdate', () => {
    it('updates an ImageBlock', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(blockWithUserTeam)
      await resolver.imageBlockUpdate(ability, 'blockId', blockUpdateInput)
      expect(service.update).toHaveBeenCalledWith('blockId', {
        ...blockUpdateInput,
        width: 640,
        height: 425,
        blurhash: 'UHFO~6Yk^6#M@-5b,1J5@[or[k6o};Fxi^OZ'
      })
    })

    it('throws error if not found', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.imageBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('block not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.block.findUnique.mockResolvedValueOnce(block)
      await expect(
        resolver.imageBlockUpdate(ability, 'blockId', blockUpdateInput)
      ).rejects.toThrow('user is not allowed to update block')
    })
  })
})

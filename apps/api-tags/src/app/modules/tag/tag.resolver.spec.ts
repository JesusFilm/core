import { Test, TestingModule } from '@nestjs/testing'

import { Tag } from '.prisma/api-tags-client'

import { PrismaService } from '../../lib/prisma.service'

import { TagResolver } from './tag.resolver'

describe('TagResolver', () => {
  let resolver: TagResolver, prisma: PrismaService

  const tag: Tag = {
    id: 'd129a025-aed2-4993-abb1-d419836704b4',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Audience',
    service: 'journeys',
    nameTranslations: [
      {
        value: 'Audience',
        primary: true,
        language: {
          id: '529'
        }
      }
    ],
    parentId: null
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TagResolver, PrismaService]
    }).compile()
    resolver = module.get<TagResolver>(TagResolver)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('tags', () => {
    it('returns Tags', async () => {
      prisma.tag.findMany = jest.fn().mockReturnValueOnce([tag])
      expect(await resolver.tags()).toEqual([tag])
      expect(prisma.tag.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' }
      })
    })
  })

  describe('name', () => {
    it('returns nameTranslations', async () => {
      expect(resolver.name(tag)).toEqual(tag.nameTranslations)
    })
  })

  describe('resolveReference', () => {
    it('returns Tag', async () => {
      prisma.tag.findUnique = jest.fn().mockReturnValueOnce(tag)
      expect(
        await resolver.resolveReference({ __typename: 'Tag', id: tag.id })
      ).toEqual(tag)
      expect(prisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: tag.id }
      })
    })
  })
})

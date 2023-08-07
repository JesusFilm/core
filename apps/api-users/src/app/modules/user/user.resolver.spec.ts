import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'

import { UserResolver } from './user.resolver'

describe('UserResolver', () => {
  let resolver: UserResolver, prisma: PrismaService

  const user = {
    id: '1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, PrismaService]
    }).compile()
    resolver = module.get<UserResolver>(UserResolver)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('me', () => {
    it('returns User', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValueOnce(user)
      expect(await resolver.me(user.id)).toEqual(user)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: user.id }
      })
    })
  })

  describe('resolveReference', () => {
    it('returns User', async () => {
      prisma.user.findUnique = jest.fn().mockReturnValueOnce(user)
      expect(
        await resolver.resolveReference({ __typename: 'User', id: user.id })
      ).toEqual(user)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { userId: user.id }
      })
    })
  })
})

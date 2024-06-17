import { createHash } from 'crypto'

import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import {
  api_keys as PrismaApiKey,
  PrismaClient
} from '.prisma/api-analytics-client'

import { prisma } from '../prisma'

import { getUserFromApiKey } from '.'

jest.mock('../prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

const mockPrisma = prisma as DeepMockProxy<PrismaClient>

describe('getUserFromApiKey', () => {
  describe('when apiKey is undefined', () => {
    it('returns undefined', async () => {
      expect(await getUserFromApiKey(undefined)).toBeUndefined()
    })
  })

  describe('when apiKey is not in database', () => {
    const apiKey =
      'd53cae10f378d14b6ececb9a9d787c3d5d126b5ee95b52ecf4772f9bf43e43d4'

    it('returns undefined', async () => {
      mockPrisma.api_keys.findFirst.mockResolvedValue(null)
      expect(await getUserFromApiKey(apiKey)).toBeUndefined()
      expect(mockPrisma.api_keys.findFirst).toHaveBeenCalledWith({
        include: { users: true },
        where: { key_prefix: 'd53cae' }
      })
    })
  })

  describe('when apiKey is in database', () => {
    const apiKey =
      'd53cae10f378d14b6ececb9a9d787c3d5d126b5ee95b52ecf4772f9bf43e43d4'

    const prismaUser = {
      id: 1,
      email: 'admin@example.com'
    }

    const keyHash = createHash('sha256')
      .update(`${process.env.PLAUSIBLE_SECRET_KEY_BASE}${apiKey}`)
      .digest('hex')
      .toLowerCase()

    it('returns undefined', async () => {
      mockPrisma.api_keys.findFirst.mockResolvedValue({
        key_hash: keyHash,
        users: prismaUser
      } as unknown as PrismaApiKey)

      expect(await getUserFromApiKey(apiKey)).toEqual(prismaUser)
      expect(mockPrisma.api_keys.findFirst).toHaveBeenCalledWith({
        include: { users: true },
        where: { key_prefix: 'd53cae' }
      })
    })
  })
})

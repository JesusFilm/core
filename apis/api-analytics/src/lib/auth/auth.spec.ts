import { createHash } from 'node:crypto'

import { api_keys as PrismaApiKey } from '@core/prisma/analytics/client'

import { prismaMock } from '../../../test/prismaMock'

import { getUserFromApiKey } from '.'

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
      prismaMock.api_keys.findFirst.mockResolvedValue(null)
      expect(await getUserFromApiKey(apiKey)).toBeUndefined()
      expect(prismaMock.api_keys.findFirst).toHaveBeenCalledWith({
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

    it('returns user', async () => {
      prismaMock.api_keys.findFirst.mockResolvedValue({
        key_hash: keyHash,
        users: prismaUser
      } as unknown as PrismaApiKey)

      expect(await getUserFromApiKey(apiKey)).toEqual(prismaUser)
      expect(prismaMock.api_keys.findFirst).toHaveBeenCalledWith({
        include: { users: true },
        where: { key_prefix: 'd53cae' }
      })
    })
  })
})

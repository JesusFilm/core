import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient } from '@core/prisma-media/client'

import { prisma } from '@core/prisma-media/client'

jest.mock('@core/prisma-media/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

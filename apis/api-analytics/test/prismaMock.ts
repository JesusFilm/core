import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { prisma, PrismaClient } from '@core/prisma-analytics/client'

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { prisma, PrismaClient } from '@core/prisma-languages/client'

jest.mock('@core/prisma-languages/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

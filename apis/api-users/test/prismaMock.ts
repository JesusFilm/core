import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { prisma, PrismaClient } from '@core/prisma-users/client'

jest.mock('@core/prisma-users/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

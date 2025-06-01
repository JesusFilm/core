import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { prisma, PrismaClient } from '@core/prisma-journeys/client'

jest.mock('@core/prisma-journeys/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const prismaMock = prisma as DeepMockProxy<PrismaClient>

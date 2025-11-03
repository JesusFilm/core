import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/analytics/client'

jest.mock('@core/prisma/analytics/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/analytics/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

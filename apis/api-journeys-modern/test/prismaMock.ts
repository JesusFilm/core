import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/journeys/client'

jest.mock('@core/prisma/journeys/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/journeys/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const prismaMock = prisma as DeepMockProxy<PrismaClient>

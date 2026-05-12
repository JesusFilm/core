import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/media/client'

jest.mock('@core/prisma/media/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/media/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- load-bearing for downstream specs calling .mockResolvedValue
export const prismaMock = prisma as DeepMockProxy<PrismaClient>

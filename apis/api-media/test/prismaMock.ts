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

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

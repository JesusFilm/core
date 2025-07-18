import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/languages/client'

jest.mock('@core/prisma/languages/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/languages/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

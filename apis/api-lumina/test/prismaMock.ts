import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/lumina/client'

jest.mock('@core/prisma/lumina/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/lumina/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

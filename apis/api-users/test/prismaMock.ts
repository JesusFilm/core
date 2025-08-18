import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/users/client'

jest.mock('@core/prisma/users/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/users/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

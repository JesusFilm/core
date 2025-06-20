import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient } from '.prisma/api-journeys-modern-client'

import { prisma } from '../src/lib/prisma'

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const prismaMock = prisma as DeepMockProxy<PrismaClient>

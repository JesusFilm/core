import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient } from '.prisma/api-media-client'

import { prisma } from '../src/lib/prisma'

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

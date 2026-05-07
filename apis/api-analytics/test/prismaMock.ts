import { beforeEach, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/analytics/client'

vi.mock('@core/prisma/analytics/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/analytics/client')),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

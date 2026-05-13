import { beforeEach, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/media/client'

vi.mock('@core/prisma/media/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/media/client')),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- load-bearing for downstream specs calling .mockResolvedValue
export const prismaMock = prisma as DeepMockProxy<PrismaClient>

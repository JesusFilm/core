import { beforeEach, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/journeys/client'

vi.mock('@core/prisma/journeys/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/journeys/client')),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(journeysPrismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- load-bearing for downstream specs calling .mockResolvedValue
export const journeysPrismaMock = prisma as DeepMockProxy<PrismaClient>

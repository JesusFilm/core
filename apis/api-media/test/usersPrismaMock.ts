import { beforeEach, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/users/client'

vi.mock('@core/prisma/users/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/users/client')),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(usersPrismaMock)
})

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- load-bearing for downstream specs calling .mockResolvedValue
export const usersPrismaMock = prisma as DeepMockProxy<PrismaClient>

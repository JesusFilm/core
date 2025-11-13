import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'

import { PrismaClient, prisma } from '@core/prisma/users/client'

jest.mock('@core/prisma/users/client', () => ({
  __esModule: true,
  ...jest.requireActual('@core/prisma/users/client'),
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
  // Ensure $transaction executes the callback with the mocked client
  // so calls like tx.user.update hit prismaMock.user.update in tests.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(prismaMock.$transaction as any).mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (fn: (tx: DeepMockProxy<PrismaClient>) => Promise<unknown>) => {
      return await fn(prismaMock)
    }
  )
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>

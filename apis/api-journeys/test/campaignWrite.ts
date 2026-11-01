import { DeepMockProxy } from 'vitest-mock-extended'

import { Prisma, PrismaClient } from '@core/prisma/journeys/client'

/**
 * Run every `$transaction` callback against the Prisma mock itself, so a
 * Campaign Write's locks, body and touch land on the mocks a spec asserts.
 */
export function mockTransaction(prismaMock: DeepMockProxy<PrismaClient>): void {
  prismaMock.$transaction.mockImplementation(
    async (callback: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
      await callback(prismaMock)
  )
}

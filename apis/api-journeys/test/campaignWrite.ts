import { vi } from 'vitest'
import { DeepMockProxy } from 'vitest-mock-extended'

import { Prisma, PrismaClient } from '@core/prisma/journeys/client'

import {
  CampaignWrite,
  CampaignWriteDeclaration,
  CampaignWriteOptions,
  CampaignWriteStep,
  campaignWrite
} from '../src/schema/campaign/campaignWrite'
import { logger } from '../src/schema/logger'

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

/** One `campaignWrite` call, as `fakeCampaignWrite` recorded it. */
export interface CampaignWriteCall {
  campaignId: string
  declaration: CampaignWriteDeclaration
  options?: CampaignWriteOptions
  /** The after-commit jobs the body queued, in order. */
  jobs: Array<() => Promise<void>>
  /** The external step the body registered, if any. */
  step?: CampaignWriteStep
  /**
   * The write ends with the touch: its body returned, and neither
   * `touch: false` nor `skipTouch()` turned the touch off.
   */
  touched: boolean
}

/**
 * Stand in for the Campaign Write, so a spec asserts what a mutation
 * declares rather than the SQL the module turns it into (that is
 * `campaignWrite.spec.ts`'s job). The spec must `vi.mock` the
 * `campaignWrite` module itself, with `campaignWrite: vi.fn()`.
 *
 * Each call is recorded, then its body runs against `prismaMock` with a
 * `write` handle; once the body returns, the external step's `apply` runs,
 * then the queued jobs, in the module's order, so the spec's mocks of what
 * they call still see their calls. A job that throws is logged as the module
 * logs it, and the rest still run. No lock is taken and no touch is written:
 * the record says whether the module would have touched.
 */
export function fakeCampaignWrite(
  prismaMock: DeepMockProxy<PrismaClient>
): CampaignWriteCall[] {
  if (!vi.isMockFunction(campaignWrite))
    throw new Error(
      'fakeCampaignWrite needs vi.mock of the campaignWrite module first'
    )
  const calls: CampaignWriteCall[] = []

  async function fake<T>(
    campaignId: string,
    declaration: CampaignWriteDeclaration,
    body: (write: CampaignWrite) => Promise<T>,
    options?: CampaignWriteOptions
  ): Promise<T> {
    const call: CampaignWriteCall = {
      campaignId,
      declaration,
      options,
      jobs: [],
      touched: false
    }
    calls.push(call)
    let touch = declaration.touch ?? true
    const result = await body({
      tx: prismaMock,
      afterCommit: (job) => {
        call.jobs.push(job)
      },
      externalStep: (step) => {
        if (call.step != null)
          throw new Error('a campaign write has at most one external step')
        call.step = step
      },
      skipTouch: () => {
        touch = false
      }
    })
    call.touched = touch
    await call.step?.apply()
    for (const job of call.jobs) {
      try {
        await job()
      } catch (error) {
        logger.error({ error, campaignId }, 'campaign after-commit job failed')
      }
    }
    return result
  }

  vi.mocked(campaignWrite).mockImplementation(fake)
  return calls
}

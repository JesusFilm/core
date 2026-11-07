import { CAMPAIGN_FIXTURE_DATE } from './campaignFactory'
import { prismaMock } from './prismaMock'

/** The upsert as Prisma answers it: the row after `update` (or `create`) was applied. */
export function mockActionUpsert(): void {
  prismaMock.campaignAction.upsert.mockImplementation((async ({
    where,
    update
  }: any) => ({
    campaignBlockId: where.campaignBlockId,
    updatedAt: CAMPAIGN_FIXTURE_DATE,
    blockId: null,
    regionId: null,
    url: null,
    target: null,
    ...update
  })) as never)
}

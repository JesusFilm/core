import { Prisma } from '@core/prisma/journeys/client'

import { CAMPAIGN_ADDRESS_SELECT } from '../src/schema/campaign/revalidateCampaign'

import { prismaMock } from './prismaMock'

/** A Campaign as the address snapshot reads it; a `CampaignFixture` is one. */
export type CampaignAddressRow = Prisma.CampaignGetPayload<{
  select: typeof CAMPAIGN_ADDRESS_SELECT
}>

/**
 * Answer each Campaign Address snapshot read (`snapshotCampaignAddress`)
 * with the next of `rows`, the last one repeating, and every other
 * `campaign.findUnique` as it was mocked before. A write reads one snapshot
 * before its change and one after, so `mockAddressSnapshots(before, after)`
 * is the address change it made. Call it after the spec's other
 * `campaign.findUnique` mocks.
 */
export function mockAddressSnapshots(
  ...rows: Array<CampaignAddressRow | null>
): void {
  const findUnique = prismaMock.campaign.findUnique.getMockImplementation()
  let reads = 0
  prismaMock.campaign.findUnique.mockImplementation(((
    args: Prisma.CampaignFindUniqueArgs
  ) => {
    if (args.select !== CAMPAIGN_ADDRESS_SELECT) return findUnique?.(args)
    const row = rows[Math.min(reads, rows.length - 1)]
    reads += 1
    return Promise.resolve(row)
  }) as never)
}

import { CampaignBlockWithCampaignAcl } from '../src/schema/campaign/block/service'

import { CampaignBlockRow, CampaignFixture } from './campaignFactory'

/** One seeded block as `authorizeBlockUpdate` loads it: with its action and its campaign's ACL. */
export function campaignBlockWithAcl(
  fixture: CampaignFixture,
  blockId: string,
  overrides: Partial<CampaignBlockRow> = {}
): CampaignBlockWithCampaignAcl {
  const block = fixture.blocks.find((candidate) => candidate.id === blockId)
  if (block == null) throw new Error(`no seeded block ${blockId}`)
  const { team, languages, theme, pages, blocks, regions, strings, ...row } =
    fixture
  return { ...block, ...overrides, campaign: { ...row, team } }
}

import { CampaignRegionWithCampaignAcl } from '../src/schema/campaign/region/service'

import { CampaignFixture, CampaignRegionRow } from './campaignFactory'

/** One fixture region as `authorizeRegionUpdate` loads it: with its campaign's ACL. */
export function campaignRegionWithAcl(
  fixture: CampaignFixture,
  regionId: string,
  overrides: Partial<CampaignRegionRow> = {}
): CampaignRegionWithCampaignAcl {
  const region = fixture.regions.find((candidate) => candidate.id === regionId)
  if (region == null) throw new Error(`no fixture region ${regionId}`)
  const { team, languages, theme, pages, blocks, regions, strings, ...row } =
    fixture
  const {
    languages: _languages,
    countries: _countries,
    ...regionRow
  } = { ...region, ...overrides }
  return { ...regionRow, campaign: { ...row, team } }
}

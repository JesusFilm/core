import { CampaignRegionWithCampaignAcl } from '../src/schema/campaign/region/service'
import { CampaignRegionLanguageWithCampaignAcl } from '../src/schema/campaign/regionLanguage/service'

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

/**
 * One fixture Share Language as `authorizeRegionLanguageUpdate` loads it:
 * with its region, the region's campaign ACL and its Campaign QR Code (none
 * unless given).
 */
export function campaignRegionLanguageWithAcl(
  fixture: CampaignFixture,
  regionId: string,
  languageId: string,
  overrides: Partial<CampaignRegionLanguageWithCampaignAcl> = {}
): CampaignRegionLanguageWithCampaignAcl {
  const region = fixture.regions.find((candidate) => candidate.id === regionId)
  const row = region?.languages.find(
    (candidate) => candidate.languageId === languageId
  )
  if (row == null) throw new Error(`no fixture language ${languageId}`)
  return {
    ...row,
    region: campaignRegionWithAcl(fixture, regionId),
    qrCode: null,
    ...overrides
  }
}

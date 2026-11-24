import { campaignPublic, chromeBlocks } from '../testData'

import { campaignChromeTrees } from './campaignChromeTrees'

describe('campaignChromeTrees', () => {
  it('treeds the header and footer from the chrome list', () => {
    const { header, footer } = campaignChromeTrees(campaignPublic)
    expect(header.__typename).toBe('CampaignHeaderBlock')
    expect(footer.__typename).toBe('CampaignFooterBlock')
    expect(header.children.length).toBeGreaterThan(0)
  })

  it('throws when the chrome lacks the header or the footer', () => {
    const withoutHeader = chromeBlocks.filter(
      (block) => block.__typename !== 'CampaignHeaderBlock'
    )
    expect(() =>
      campaignChromeTrees({ ...campaignPublic, chrome: withoutHeader })
    ).toThrow('Campaign chrome has no CampaignHeaderBlock')
    expect(() =>
      campaignChromeTrees({ ...campaignPublic, chrome: [] })
    ).toThrow('Campaign chrome has no CampaignHeaderBlock')
  })
})

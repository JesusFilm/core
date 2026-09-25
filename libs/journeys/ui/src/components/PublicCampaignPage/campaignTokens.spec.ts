import {
  buildEmbedUrl,
  buildShareUrl,
  formatViews,
  shareJourneyLanguageLabel
} from './campaignTokens'
import {
  mockShareJourney,
  mockShareJourneySpanish
} from './publicCampaignPageData.mock'

describe('campaignTokens', () => {
  it('builds share and embed urls without doubling slashes', () => {
    expect(buildShareUrl('https://your.nextstep.is/', 'a-slug')).toBe(
      'https://your.nextstep.is/a-slug'
    )
    expect(buildEmbedUrl('https://your.nextstep.is', 'a-slug')).toBe(
      'https://your.nextstep.is/embed/a-slug?expand=false'
    )
  })

  it('labels languages with the English name and native name when they differ', () => {
    expect(shareJourneyLanguageLabel(mockShareJourneySpanish)).toBe(
      'Spanish (Español)'
    )
    expect(shareJourneyLanguageLabel(mockShareJourney)).toBe('English')
    expect(
      shareJourneyLanguageLabel({
        ...mockShareJourney,
        language: { id: 'x', name: [] }
      })
    ).toBe('Where You Belong')
  })

  it('formats view counts with grouping', () => {
    expect(formatViews(47415)).toBe('47,415')
  })
})

import {
  campaignAllowedProps,
  campaignGoals,
  campaignSiteId,
  teamSiteId
} from './campaignPlausibleSite'

describe('campaignPlausibleSite', () => {
  it('names the campaign and team sites', () => {
    expect(campaignSiteId('campaignId')).toBe(
      'api-journeys-campaign-campaignId'
    )
    expect(teamSiteId('teamId')).toBe('api-journeys-team-teamId')
  })

  it('makes every campaign event a goal, plus outbound link clicks', () => {
    expect(campaignGoals).toEqual([
      'campaignJourneyClick',
      'campaignRegionClick',
      'campaignQrDownload',
      'campaignShareLinkCopy',
      'Outbound Link: Click'
    ])
  })

  it('allows every page and event prop once, except campaign_id', () => {
    expect(campaignAllowedProps).toEqual([
      'region',
      'language',
      'journey',
      'source',
      'shareLanguage',
      'targetRegion'
    ])
  })
})

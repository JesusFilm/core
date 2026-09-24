import { buildCampaignPublicUrl } from './buildCampaignPublicUrl'

describe('buildCampaignPublicUrl', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
  })

  it('falls back to the production host when the env var is unset or empty', () => {
    process.env = { ...originalEnv, NEXT_PUBLIC_JOURNEYS_URL: '' }
    expect(buildCampaignPublicUrl('world-cup')).toBe(
      'https://your.nextstep.is/campaign/world-cup'
    )
  })

  it('uses the configured host, trims trailing slashes and encodes the slug', () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'https://journeys.example/'
    }
    expect(buildCampaignPublicUrl('a b')).toBe(
      'https://journeys.example/campaign/a%20b'
    )
  })
})

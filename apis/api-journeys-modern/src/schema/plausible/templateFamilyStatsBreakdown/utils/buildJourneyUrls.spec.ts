import { buildJourneyUrl } from './buildJourneyUrls'

jest.mock('../../../../env', () => ({
  env: {
    get JOURNEYS_URL(): string | undefined {
      return process.env.JOURNEYS_URL
    }
  }
}))

describe('buildJourneyUrl', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should use first custom domain when multiple are available', () => {
    const customDomains = [
      { name: 'first-domain.com' },
      { name: 'second-domain.com' }
    ]
    const slug = 'my-journey-slug'

    const result = buildJourneyUrl(slug, customDomains)

    expect(result).toBe('https://first-domain.com/my-journey-slug')
  })

  it('should use JOURNEYS_URL environment variable when no custom domain', () => {
    process.env.JOURNEYS_URL = 'https://env-journeys-url.com'
    const slug = 'my-journey-slug'

    const result = buildJourneyUrl(slug, [])

    expect(result).toBe('https://env-journeys-url.com/my-journey-slug')
  })
})

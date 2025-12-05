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
    const customDomains: never[] = []
    const slug = 'my-journey-slug'

    const result = buildJourneyUrl(slug, customDomains)

    expect(result).toBe('https://env-journeys-url.com/my-journey-slug')
  })

  it('should fallback to default production URL when no custom domain and no JOURNEYS_URL', () => {
    delete process.env.JOURNEYS_URL
    const customDomains: never[] = []
    const slug = 'my-journey-slug'

    const result = buildJourneyUrl(slug, customDomains)

    expect(result).toBe('https://your.nextstep.is/my-journey-slug')
  })
})
// dsiofsdifusfsdfiejdjjbzsrara0rr a90 urfasif ooasdiofdfsasdasdasdasdaassdaaaaaassaaaaaaassaaaaaaaaaaaaaaaa

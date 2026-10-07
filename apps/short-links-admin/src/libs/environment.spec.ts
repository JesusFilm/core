import {
  getEnvironmentBannerHeight,
  isProductionEnvironment,
  isStagingEnvironment,
  shouldShowEnvironmentBanner
} from './environment'

describe('environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('recognises the stage gateway by hostname', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_GATEWAY_URL',
      'https://api-gateway.stage.central.jesusfilm.org/'
    )

    expect(isStagingEnvironment()).toBe(true)
    expect(isProductionEnvironment()).toBe(false)
    expect(shouldShowEnvironmentBanner()).toBe(true)
    expect(getEnvironmentBannerHeight()).toBe(38)
  })

  it('does not treat a stage hostname elsewhere in the URL as stage', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_GATEWAY_URL',
      'https://evil.example.com/?next=https://api-gateway.stage.central.jesusfilm.org/'
    )

    expect(isStagingEnvironment()).toBe(false)
    expect(getEnvironmentBannerHeight()).toBe(0)
  })

  it('recognises production and shows no banner', () => {
    vi.stubEnv(
      'NEXT_PUBLIC_GATEWAY_URL',
      'https://api-gateway.central.jesusfilm.org/'
    )

    expect(isProductionEnvironment()).toBe(true)
    expect(isStagingEnvironment()).toBe(false)
    expect(shouldShowEnvironmentBanner()).toBe(false)
  })

  it('treats an unset or malformed gateway URL as not stage', () => {
    vi.stubEnv('NEXT_PUBLIC_GATEWAY_URL', '')
    expect(isStagingEnvironment()).toBe(false)

    vi.stubEnv('NEXT_PUBLIC_GATEWAY_URL', 'not a url')
    expect(isStagingEnvironment()).toBe(false)
  })
})

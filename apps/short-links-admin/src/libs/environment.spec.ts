type EnvironmentModule = typeof import('./environment')

/** `env` is read when the module loads, so each case loads it afresh. */
async function loadWithGateway(url: string): Promise<EnvironmentModule> {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_GATEWAY_URL', url)
  return await import('./environment')
}

describe('environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('recognises the stage gateway by hostname', async () => {
    const environment = await loadWithGateway(
      'https://api-gateway.stage.central.jesusfilm.org/'
    )

    expect(environment.isStagingEnvironment()).toBe(true)
    expect(environment.isProductionEnvironment()).toBe(false)
    expect(environment.shouldShowEnvironmentBanner()).toBe(true)
    expect(environment.getEnvironmentBannerHeight()).toBe(38)
  })

  it('does not treat a stage hostname elsewhere in the URL as stage', async () => {
    const environment = await loadWithGateway(
      'https://evil.example.com/?next=https://api-gateway.stage.central.jesusfilm.org/'
    )

    expect(environment.isStagingEnvironment()).toBe(false)
    expect(environment.getEnvironmentBannerHeight()).toBe(0)
  })

  it('recognises production and shows no banner', async () => {
    const environment = await loadWithGateway(
      'https://api-gateway.central.jesusfilm.org/'
    )

    expect(environment.isProductionEnvironment()).toBe(true)
    expect(environment.isStagingEnvironment()).toBe(false)
    expect(environment.shouldShowEnvironmentBanner()).toBe(false)
  })
})

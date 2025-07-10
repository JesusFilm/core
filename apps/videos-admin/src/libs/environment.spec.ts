import {
  getEnvironmentBannerHeight,
  isProductionEnvironment,
  isStagingEnvironment,
  shouldShowEnvironmentBanner
} from './environment'

describe('environment utilities', () => {
  const originalEnv = process.env.NEXT_PUBLIC_GATEWAY_URL

  afterEach(() => {
    process.env.NEXT_PUBLIC_GATEWAY_URL = originalEnv
  })

  describe('isProductionEnvironment', () => {
    it('should return true when NEXT_PUBLIC_GATEWAY_URL is the production URL', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.central.jesusfilm.org/'

      expect(isProductionEnvironment()).toBe(true)
    })

    it('should return false when NEXT_PUBLIC_GATEWAY_URL is not the production URL', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL = 'http://localhost:4000'

      expect(isProductionEnvironment()).toBe(false)
    })

    it('should return false when NEXT_PUBLIC_GATEWAY_URL is undefined', () => {
      delete process.env.NEXT_PUBLIC_GATEWAY_URL

      expect(isProductionEnvironment()).toBe(false)
    })

    it('should return false when NEXT_PUBLIC_GATEWAY_URL is empty string', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL = ''

      expect(isProductionEnvironment()).toBe(false)
    })
  })

  describe('isStagingEnvironment', () => {
    it('should return true when NEXT_PUBLIC_GATEWAY_URL contains stage.central.jesusfilm.org', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.stage.central.jesusfilm.org/'

      expect(isStagingEnvironment()).toBe(true)
    })

    it('should return false when NEXT_PUBLIC_GATEWAY_URL is production', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.central.jesusfilm.org/'

      expect(isStagingEnvironment()).toBe(false)
    })

    it('should return false when NEXT_PUBLIC_GATEWAY_URL is localhost', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL = 'http://localhost:4000'

      expect(isStagingEnvironment()).toBe(false)
    })

    it('should return false when NEXT_PUBLIC_GATEWAY_URL is undefined', () => {
      delete process.env.NEXT_PUBLIC_GATEWAY_URL

      expect(isStagingEnvironment()).toBe(false)
    })
  })

  describe('shouldShowEnvironmentBanner', () => {
    it('should return true only in staging environment', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.stage.central.jesusfilm.org/'

      expect(shouldShowEnvironmentBanner()).toBe(true)
    })

    it('should return false in production environment', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.central.jesusfilm.org/'

      expect(shouldShowEnvironmentBanner()).toBe(false)
    })

    it('should return false in localhost environment', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL = 'http://localhost:4000'

      expect(shouldShowEnvironmentBanner()).toBe(false)
    })
  })

  describe('getEnvironmentBannerHeight', () => {
    it('should return 0 when not showing banner (production)', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.central.jesusfilm.org/'

      expect(getEnvironmentBannerHeight()).toBe(0)
    })

    it('should return 0 when not showing banner (localhost)', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL = 'http://localhost:4000'

      expect(getEnvironmentBannerHeight()).toBe(0)
    })

    it('should return 44 when showing banner (staging)', () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL =
        'https://api-gateway.stage.central.jesusfilm.org/'

      expect(getEnvironmentBannerHeight()).toBe(44)
    })
  })
})

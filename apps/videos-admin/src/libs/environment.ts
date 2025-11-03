const PRODUCTION_GATEWAY_URL = 'https://api-gateway.central.jesusfilm.org/'

export function isProductionEnvironment(): boolean {
  return process.env.NEXT_PUBLIC_GATEWAY_URL === PRODUCTION_GATEWAY_URL
}

export function isStagingEnvironment(): boolean {
  const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL
  return gatewayUrl?.includes('stage.central.jesusfilm.org') ?? false
}

export function shouldShowEnvironmentBanner(): boolean {
  return isStagingEnvironment()
}

export function getEnvironmentBannerHeight(): number {
  // Return the height of the environment banner in pixels
  // This should match the banner height in EnvironmentBanner component
  // 36px height + 2px border = 38px total
  return shouldShowEnvironmentBanner() ? 38 : 0
}

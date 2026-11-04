import { env } from '../env'

const PRODUCTION_GATEWAY_URL = 'https://api-gateway.central.jesusfilm.org/'
const STAGE_GATEWAY_HOSTNAME = 'api-gateway.stage.central.jesusfilm.org'

function gatewayHostname(): string | null {
  const gatewayUrl = env.NEXT_PUBLIC_GATEWAY_URL
  if (gatewayUrl == null || !URL.canParse(gatewayUrl)) return null
  return new URL(gatewayUrl).hostname
}

export function isProductionEnvironment(): boolean {
  return env.NEXT_PUBLIC_GATEWAY_URL === PRODUCTION_GATEWAY_URL
}

export function isStagingEnvironment(): boolean {
  const hostname = gatewayHostname()
  return (
    hostname === STAGE_GATEWAY_HOSTNAME ||
    hostname?.endsWith('.stage.central.jesusfilm.org') === true
  )
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

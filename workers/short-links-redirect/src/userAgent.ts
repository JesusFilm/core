/**
 * A small, dependency-free user-agent classifier for the queue consumer. It
 * only needs to be good enough for dashboard breakdowns (device class, OS,
 * browser); the raw user agent is dropped after parsing and never stored.
 */

export type DeviceClass = 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown'

export type OperatingSystem =
  | 'iOS'
  | 'Android'
  | 'Windows'
  | 'macOS'
  | 'Linux'
  | 'ChromeOS'
  | 'unknown'

export type Browser =
  | 'Chrome'
  | 'Safari'
  | 'Firefox'
  | 'Edge'
  | 'Samsung Internet'
  | 'Opera'
  | 'unknown'

export interface UserAgentClassification {
  deviceClass: DeviceClass
  os: OperatingSystem
  browser: Browser
}

const BOT_PATTERN =
  /bot|crawler|spider|facebookexternalhit|slackbot|twitterbot|whatsapp|preview/i

const UNKNOWN: UserAgentClassification = {
  deviceClass: 'unknown',
  os: 'unknown',
  browser: 'unknown'
}

export function classifyUserAgent(
  userAgent: string | null | undefined
): UserAgentClassification {
  if (userAgent == null || userAgent.trim() === '') return UNKNOWN

  const os = detectOs(userAgent)
  const browser = detectBrowser(userAgent)
  const deviceClass = detectDeviceClass(userAgent, os)

  return { deviceClass, os, browser }
}

function detectOs(userAgent: string): OperatingSystem {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/CrOS/.test(userAgent)) return 'ChromeOS'
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS'
  if (/Linux|X11/i.test(userAgent)) return 'Linux'
  return 'unknown'
}

function detectBrowser(userAgent: string): Browser {
  // Order matters: most of these also carry "Chrome" and "Safari" tokens.
  if (/Edg(e|A|iOS)?\//.test(userAgent)) return 'Edge'
  if (/SamsungBrowser\//.test(userAgent)) return 'Samsung Internet'
  if (/OPR\/|Opera/.test(userAgent)) return 'Opera'
  if (/Firefox\/|FxiOS\//.test(userAgent)) return 'Firefox'
  if (/Chrome\/|CriOS\//.test(userAgent)) return 'Chrome'
  if (/Safari\//.test(userAgent) && /Version\//.test(userAgent)) return 'Safari'
  return 'unknown'
}

function detectDeviceClass(
  userAgent: string,
  os: OperatingSystem
): DeviceClass {
  if (BOT_PATTERN.test(userAgent)) return 'bot'
  if (/iPad|Tablet/i.test(userAgent)) return 'tablet'
  if (os === 'Android' && !/Mobile/i.test(userAgent)) return 'tablet'
  if (/Mobile|iPhone|iPod|Android/i.test(userAgent)) return 'mobile'
  if (os === 'Windows' || os === 'macOS' || os === 'Linux' || os === 'ChromeOS')
    return 'desktop'
  return 'unknown'
}

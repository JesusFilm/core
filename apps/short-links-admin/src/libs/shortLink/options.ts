export type ShortLinkStatus = 'active' | 'paused' | 'retired'
export type ShortLinkAssetClass = 'standard' | 'permanent' | 'videoEmbedded'
export type ShortLinkPlacement =
  | 'description'
  | 'endScreen'
  | 'card'
  | 'communityPost'
  | 'inVideoQr'
  | 'other'
export type ShortLinkNotFound = 'lostPage' | 'fallback' | 'passthrough'
export type ShortLinkHealth =
  | 'ok'
  | 'notFound'
  | 'serverError'
  | 'timeout'
  | 'dns'
  | 'tls'
  | 'redirectLoop'
  | 'unknown'
export type Service =
  | 'apiJourneys'
  | 'apiLanguages'
  | 'apiMedia'
  | 'apiTags'
  | 'apiUsers'
  | 'apiVideos'
  | 'youtube'
export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export interface Option<Value extends string | number> {
  value: Value
  label: string
}

export const STATUS_OPTIONS: Option<ShortLinkStatus>[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'retired', label: 'Retired' }
]

export const ASSET_CLASS_OPTIONS: Option<ShortLinkAssetClass>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'permanent', label: 'Permanent' },
  { value: 'videoEmbedded', label: 'Video embedded' }
]

export const PLACEMENT_OPTIONS: Option<ShortLinkPlacement>[] = [
  { value: 'description', label: 'Description' },
  { value: 'endScreen', label: 'End screen' },
  { value: 'card', label: 'Card' },
  { value: 'communityPost', label: 'Community post' },
  { value: 'inVideoQr', label: 'In-video QR' },
  { value: 'other', label: 'Other' }
]

export const NOT_FOUND_OPTIONS: Option<ShortLinkNotFound>[] = [
  { value: 'lostPage', label: 'Lost page (404)' },
  { value: 'fallback', label: 'Redirect to fallback' },
  { value: 'passthrough', label: 'Pass through to origin' }
]

export const HEALTH_LABELS: Record<ShortLinkHealth, string> = {
  ok: 'OK',
  notFound: 'Not found',
  serverError: 'Server error',
  timeout: 'Timeout',
  dns: 'DNS',
  tls: 'TLS',
  redirectLoop: 'Redirect loop',
  unknown: 'Unknown'
}

export const SERVICE_OPTIONS: Option<Service>[] = [
  { value: 'apiJourneys', label: 'apiJourneys' },
  { value: 'apiLanguages', label: 'apiLanguages' },
  { value: 'apiMedia', label: 'apiMedia' },
  { value: 'apiTags', label: 'apiTags' },
  { value: 'apiUsers', label: 'apiUsers' },
  { value: 'apiVideos', label: 'apiVideos' },
  { value: 'youtube', label: 'youtube' }
]

export const REDIRECT_STATUS_OPTIONS: Option<number>[] = [
  { value: 301, label: '301 Moved Permanently' },
  { value: 302, label: '302 Found' },
  { value: 307, label: '307 Temporary Redirect' },
  { value: 308, label: '308 Permanent Redirect' }
]

export const ERROR_CORRECTION_OPTIONS: Option<QrErrorCorrection>[] = [
  { value: 'L', label: 'L (7%)' },
  { value: 'M', label: 'M (15%)' },
  { value: 'Q', label: 'Q (25%)' },
  { value: 'H', label: 'H (30%)' }
]

export function labelFor<Value extends string | number>(
  options: Option<Value>[],
  value: Value | null | undefined
): string {
  if (value == null) return ''
  return options.find((option) => option.value === value)?.label ?? `${value}`
}

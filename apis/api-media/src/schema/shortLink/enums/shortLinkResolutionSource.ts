import { builder } from '../../builder'

export const SHORT_LINK_RESOLUTION_SOURCES = [
  'link',
  'linkFallback',
  'domainFallback',
  'passthrough',
  'lostPage',
  'reserved'
] as const

export type ShortLinkResolutionSourceValue =
  (typeof SHORT_LINK_RESOLUTION_SOURCES)[number]

export const ShortLinkResolutionSource = builder.enumType(
  'ShortLinkResolutionSource',
  {
    description:
      'Which rule produced a short link resolution: the link itself, its fallback, the domain fallback, a passthrough to the domain origin, the lost page, or a reserved path',
    values: SHORT_LINK_RESOLUTION_SOURCES
  }
)

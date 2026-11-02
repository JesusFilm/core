import { QrErrorCorrection, ShortLinkAssetClass } from './options'

export interface DestinationChangeRule {
  /** Only shortLinkAdmin / publisher may change the destination. */
  requiresAdmin: boolean
  /** The UI must confirm the change before submitting. */
  requiresConfirmation: boolean
  /** A change note must accompany the change. */
  requiresNote: boolean
}

export function getDestinationChangeRule(
  assetClass: ShortLinkAssetClass
): DestinationChangeRule {
  switch (assetClass) {
    case 'permanent':
      return {
        requiresAdmin: true,
        requiresConfirmation: true,
        requiresNote: false
      }
    case 'videoEmbedded':
      return {
        requiresAdmin: true,
        requiresConfirmation: true,
        requiresNote: true
      }
    default:
      return {
        requiresAdmin: false,
        requiresConfirmation: false,
        requiresNote: false
      }
  }
}

export function canChangeDestination(
  assetClass: ShortLinkAssetClass,
  isAdmin: boolean
): boolean {
  return isAdmin || !getDestinationChangeRule(assetClass).requiresAdmin
}

export function canDeleteLink(
  assetClass: ShortLinkAssetClass,
  isAdmin: boolean
): boolean {
  return isAdmin || assetClass === 'standard'
}

export function isDestinationChanged(previous: string, next: string): boolean {
  return previous.trim() !== next.trim()
}

export interface DestinationChangeValidation {
  noteError?: string
}

export function validateDestinationChange(
  assetClass: ShortLinkAssetClass,
  note: string
): DestinationChangeValidation {
  const rule = getDestinationChangeRule(assetClass)
  if (rule.requiresNote && note.trim().length === 0) {
    return { noteError: 'A change note is required for video-embedded links' }
  }
  return {}
}

export function getDefaultErrorCorrection(
  assetClass: ShortLinkAssetClass
): QrErrorCorrection {
  return assetClass === 'videoEmbedded' ? 'H' : 'M'
}

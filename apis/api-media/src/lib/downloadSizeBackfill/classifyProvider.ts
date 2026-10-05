import type { BackfillProvider, DownloadCandidate } from './types'

export const MUX_STREAM_BASE_URL = 'https://stream.mux.com/'

/**
 * Deterministically classifies which provider is authoritative for a
 * Download's byte length. A Mux stream URL always wins, even if the row
 * also carries a linked R2 asset (data debt from an earlier migration) —
 * the URL a client actually fetches is what must be verified. A non-Mux
 * Download with a linked asset is R2-backed; everything else is legacy.
 */
export function classifyProvider(
  download: Pick<DownloadCandidate, 'url' | 'assetId'>
): BackfillProvider {
  if (download.url.startsWith(MUX_STREAM_BASE_URL)) return 'mux'
  if (download.assetId != null) return 'r2'
  return 'legacy'
}

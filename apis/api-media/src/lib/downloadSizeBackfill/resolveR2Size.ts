import type { ResolveSizeResult } from './types'

/**
 * R2 is the backup for legacy media. Use the positive content length
 * already recorded on the linked asset — never re-download it.
 */
export function resolveR2Size(
  asset: { contentLength: bigint } | null
): ResolveSizeResult {
  if (asset == null) {
    return { size: null, errorCode: 'missingAsset' }
  }

  const size = Number(asset.contentLength)
  if (Number.isFinite(size) && size > 0) {
    return { size, errorCode: null }
  }

  return { size: null, errorCode: 'invalidLength' }
}

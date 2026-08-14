import { resolveHttpSize } from './httpSize'
import type { HttpSizeClient, MuxAssetLike, ResolveSizeResult } from './types'

// Mux static rendition download URLs look like
// https://stream.mux.com/{playbackId}/{resolution}.mp4
const MUX_RENDITION_URL_PATTERN = /\/([0-9]+p)\.mp4(?:$|\?)/

export function extractMuxResolutionFromUrl(url: string): string | null {
  const match = MUX_RENDITION_URL_PATTERN.exec(url)
  return match?.[1] ?? null
}

function resolveFromRenditionMetadata(
  url: string,
  muxAsset: MuxAssetLike | null
): ResolveSizeResult | null {
  const resolution = extractMuxResolutionFromUrl(url)
  if (resolution == null) return null

  const file = muxAsset?.static_renditions?.files?.find(
    (candidate) => candidate?.resolution === resolution
  )
  if (file == null) return null
  if (file.status === 'skipped' || file.status === 'errored') return null

  const filesize = file.filesize != null ? parseInt(file.filesize, 10) : 0
  if (Number.isFinite(filesize) && filesize > 0) {
    return { size: filesize, errorCode: null }
  }

  return null
}

/**
 * Mux is the primary provider. Prefer the matching static rendition's
 * filesize; if the rendition is missing, unmatched, or reports an invalid
 * size, verify the final Mux URL directly over HTTP.
 */
export async function resolveMuxSize(
  url: string,
  muxAsset: MuxAssetLike | null,
  httpClient: HttpSizeClient
): Promise<ResolveSizeResult> {
  const fromRendition = resolveFromRenditionMetadata(url, muxAsset)
  if (fromRendition != null) return fromRendition

  return resolveHttpSize(url, httpClient)
}

import { resolveHttpSize } from './httpSize'
import type { HttpSizeClient, MuxAssetLike, ResolveSizeResult } from './types'

// Mux static rendition download URLs look like
// https://stream.mux.com/{playbackId}/{resolution}.mp4
const MUX_RENDITION_URL_PATTERN = /\/([0-9]+p)\.mp4(?:$|\?)/

// Mux's filesize field is a decimal-string byte count. Only accept a
// strictly digit string — parseInt/Number would also accept trailing
// garbage ("500bytes"), exponential notation ("1e3"), or hex ("0x10").
const MUX_FILESIZE_PATTERN = /^[0-9]+$/

function parseMuxFilesize(filesize: string | null | undefined): number | null {
  if (filesize == null || !MUX_FILESIZE_PATTERN.test(filesize)) return null
  const size = Number(filesize)
  return Number.isSafeInteger(size) && size > 0 ? size : null
}

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
  // Only a `ready` rendition is download-ready; `preparing`, `skipped`, and
  // `errored` renditions must fall back to HTTP verification.
  if (file.status !== 'ready') return null

  const filesize = parseMuxFilesize(file.filesize)
  if (filesize != null) {
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

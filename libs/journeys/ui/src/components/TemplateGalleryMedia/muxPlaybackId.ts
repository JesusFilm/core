/**
 * Mux playback IDs are opaque URL-safe tokens (letters, digits, `-`, `_`).
 * Validate the shape before interpolating one into a `stream.mux.com/<id>.m3u8`
 * or `image.mux.com/<id>/...` URL so a malformed/hostile value can't inject the
 * path/query separators (`/`, `?`, `#`, whitespace, `.`) that would re-point or
 * truncate the request. Fail-closed: an id failing this check renders nothing.
 */
const MUX_PLAYBACK_ID_RE = /^[A-Za-z0-9_-]+$/

export function isValidMuxPlaybackId(playbackId: string): boolean {
  return MUX_PLAYBACK_ID_RE.test(playbackId)
}

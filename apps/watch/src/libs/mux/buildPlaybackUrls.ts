import type { MuxPlaybackUrls } from '../../types/inserts'

const STREAM_BASE = 'https://stream.mux.com'
const IMAGE_BASE = 'https://image.mux.com'

export function buildPlaybackUrls(playbackId: string): MuxPlaybackUrls {
  const trimmed = playbackId.trim()
  if (trimmed.length === 0) {
    throw new Error('A playbackId is required to build URLs')
  }

  return {
    hls: `${STREAM_BASE}/${trimmed}.m3u8`,
    poster: `${IMAGE_BASE}/${trimmed}/thumbnail.jpg?time=1`,
    mp4: {
      medium: `${STREAM_BASE}/${trimmed}/medium.mp4`,
      high: `${STREAM_BASE}/${trimmed}/high.mp4`
    }
  }
}

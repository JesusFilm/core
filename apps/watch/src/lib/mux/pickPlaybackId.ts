import { randomPick, type RandomPickOptions } from '../rng/randomPick'

export interface PickPlaybackIdResult {
  playbackId: string
  index: number
}

export type PickPlaybackIdOptions = RandomPickOptions

export function pickPlaybackId(
  playbackIds: readonly string[],
  options: PickPlaybackIdOptions = {}
): PickPlaybackIdResult {
  const { value, index } = randomPick(playbackIds, options)

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console -- development tracing for editors
    console.debug('[mux] Selected playback ID', { value, index })
  }

  return {
    playbackId: value,
    index
  }
}

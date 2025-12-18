import { type RandomPickOptions, randomPick } from './randomPick'

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

  return {
    playbackId: value,
    index
  }
}

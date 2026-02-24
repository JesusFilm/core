import { getVideo } from '../video/service'

export async function getMuxTrackByBcp47(
  assetId: string,
  bcp47: string,
  isUserGenerated: boolean
) {
  const muxAsset = await getVideo(assetId, isUserGenerated)

  const muxTrack = muxAsset?.tracks?.find(
    (track) =>
      track.type === 'text' &&
      track.language_code === bcp47 &&
      track.text_source === 'generated_vod'
  )

  return muxTrack
}

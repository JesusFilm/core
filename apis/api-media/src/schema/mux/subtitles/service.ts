import Mux from '@mux/mux-node'
import { z } from 'zod'

import { getClient, getVideo } from '../services'

// Zod schema for validating Mux subtitle response
const muxSubtitleResponseSchema = z.object({
  id: z.string(),
  language_code: z.string(),
  name: z.string(),
  status: z.string()
})

const muxSubtitleResponseArraySchema = z.array(muxSubtitleResponseSchema)

export async function createGeneratedSubtitlesByAssetId(
  userGenerated: boolean,
  assetId: string,
  languageCode: string,
  name: string
): Promise<Mux.Video.AssetGenerateSubtitlesResponse> {
  const asset = await getVideo(assetId, userGenerated)
  const track = asset.tracks?.find(
    (track) => track.type === 'audio' && track.language_code === languageCode
  )
  if (track == null || track.id == null)
    throw new Error('Audio track not found')

  return await getClient(userGenerated).video.assets.generateSubtitles(
    assetId,
    track.id,
    {
      generated_subtitles: [
        {
          language_code:
            languageCode as Mux.Video.AssetGenerateSubtitlesParams.GeneratedSubtitle['language_code'],
          name: name
        }
      ]
    }
  )
}

export async function getSubtitleTrack(
  assetId: string,
  trackId: string,
  userGenerated: boolean
): Promise<Mux.Video.Track | null> {
  const muxAsset = await getVideo(assetId, userGenerated)

  // Find the specific subtitle track in the asset's tracks array
  const muxTrack = muxAsset.tracks?.find(
    (track) => track.id === trackId && track.type === 'text'
  )

  return muxTrack ?? null
}

// Export schemas for validation
export { muxSubtitleResponseSchema, muxSubtitleResponseArraySchema }

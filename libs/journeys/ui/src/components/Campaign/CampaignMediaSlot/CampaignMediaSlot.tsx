import { ReactElement } from 'react'

import { CampaignPicture } from '../CampaignImage'
import { CampaignVideo } from '../CampaignVideo'
import { campaignImageSource } from '../libs/campaignImageSource'
import type { CampaignTree } from '../types'

/**
 * Whether a Media Slot holds something to show: an image with a picture
 * (`campaignImageSource`, so only an https `src`), or a video whose
 * federated `mediaVideo` resolved.
 */
export function hasCampaignMedia(
  media: CampaignTree | null | undefined
): media is CampaignTree {
  if (media == null) return false
  if (media.__typename === 'CampaignImageBlock')
    return campaignImageSource(media) != null
  if (media.__typename === 'CampaignVideoBlock') return media.mediaVideo != null
  return false
}

interface CampaignMediaSlotProps {
  media: CampaignTree | null
  /** The slot sits under the text at every width, so a picture takes the wide frame rather than 4:3. */
  stacked?: boolean
  /** The Hero's slot: its picture, or its video's poster, loads at once with high priority. */
  eager?: boolean
}

/**
 * The single owned video or image of a Hero or Featured Media section,
 * found through the section's `mediaBlockId`. An empty slot renders nothing.
 * A picture is cropped 4:3 beside the text and 16:9 when stacked, and loads
 * lazily unless `eager`.
 */
export function CampaignMediaSlot({
  media,
  stacked = false,
  eager = false
}: CampaignMediaSlotProps): ReactElement | null {
  if (!hasCampaignMedia(media)) return null
  if (media.__typename === 'CampaignVideoBlock')
    return <CampaignVideo block={media} eager={eager} />
  const image = campaignImageSource(media)
  if (image == null) return null
  return (
    <CampaignPicture
      image={image}
      ratio={stacked ? 'wide' : 'standard'}
      eager={eager}
    />
  )
}

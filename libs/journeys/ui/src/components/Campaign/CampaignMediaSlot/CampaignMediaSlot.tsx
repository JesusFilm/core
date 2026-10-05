import { ReactElement } from 'react'

import { CampaignPicture } from '../CampaignImage'
import { CampaignVideo } from '../CampaignVideo'
import { campaignImageSource } from '../libs/campaignImageSource'
import type { CampaignTree } from '../types'
import { hasText } from '../types'

/**
 * Whether a Media Slot holds something to show: an image with a `src`, or a
 * video whose federated `mediaVideo` resolved.
 */
export function hasCampaignMedia(
  media: CampaignTree | null | undefined
): media is CampaignTree {
  if (media == null) return false
  if (media.__typename === 'CampaignImageBlock') return hasText(media.src)
  if (media.__typename === 'CampaignVideoBlock') return media.mediaVideo != null
  return false
}

interface CampaignMediaSlotProps {
  media: CampaignTree | null
}

/**
 * The single owned video or image of a Hero or Featured Media section,
 * found through the section's `mediaBlockId`. An empty slot renders nothing.
 */
export function CampaignMediaSlot({
  media
}: CampaignMediaSlotProps): ReactElement | null {
  if (!hasCampaignMedia(media)) return null
  if (media.__typename === 'CampaignVideoBlock')
    return <CampaignVideo block={media} />
  const image = campaignImageSource(media)
  if (image == null) return null
  return <CampaignPicture image={image} />
}

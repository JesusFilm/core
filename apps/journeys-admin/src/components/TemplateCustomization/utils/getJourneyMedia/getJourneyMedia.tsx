import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../__generated__/GetJourney'

export type JourneyMedia = ImageBlock | VideoBlock

export function getJourneyMedia(journey?: Journey): JourneyMedia[] {
  const customizableLogoBlock = journey?.logoImageBlock?.customizable
    ? [journey?.logoImageBlock]
    : []
  const customizableImageBlocks =
    journey?.blocks?.filter(
      (block): block is ImageBlock =>
        block.__typename === 'ImageBlock' && block.customizable === true
    ) ?? []
  const customizableVideoBlocks =
    journey?.blocks?.filter(
      (block): block is VideoBlock =>
        block.__typename === 'VideoBlock' && block.customizable === true
    ) ?? []
  return [
    ...customizableLogoBlock,
    ...customizableImageBlocks,
    ...customizableVideoBlocks
  ]
}

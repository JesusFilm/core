import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'

export function getJourneyMedia(journey?: Journey) {
    const customizableLogoBlock = journey?.logoImageBlock?.customizable && journey.logoImageBlock 
    const customizableImageBlocks = journey?.blocks?.filter(block => block.__typename === 'ImageBlock' && block.customizable) ?? []
    const customizableVideoBlocks = journey?.blocks?.filter(block => block.__typename === 'VideoBlock' && block.customizable) ?? []
  return [customizableLogoBlock, ...customizableImageBlocks, ...customizableVideoBlocks]
  }
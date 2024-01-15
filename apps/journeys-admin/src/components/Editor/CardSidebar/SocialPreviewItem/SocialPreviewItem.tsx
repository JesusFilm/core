import Image from 'next/image'
import { ReactElement } from 'react'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'

import { JourneyEditContentComponentItem } from '../JourneyEditContentComponentItem'

export function SocialPreviewItem(): ReactElement {
  const { journey } = useJourney()
  return (
    <JourneyEditContentComponentItem
      component={ActiveJourneyEditContent.SocialPreview}
    >
      {journey?.primaryImageBlock?.src == null ? (
        <ThumbsUpIcon color="error" />
      ) : (
        <Image
          src={journey.primaryImageBlock.src}
          alt={journey.primaryImageBlock.src}
          width={76}
          height={76}
          style={{
            objectFit: 'cover'
          }}
        />
      )}
    </JourneyEditContentComponentItem>
  )
}

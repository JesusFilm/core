import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import {
  CardsSection,
  ImagesSection,
  LogoSection,
  VideosSection
} from './Sections'
import {
  showImagesSection,
  showLogoSection,
  showVideosSection
} from './utils'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock
} from '../../../../../../__generated__/GetJourney'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

interface MediaScreenProps {
  handleNext: () => void
}

/**
 * getFirstCardWithImages is a temporary implementation until the "CardCarousel" PR is merged 
 * that will enable using "selected card" to find images instead
 */
function getFirstCardWithImages(journey: Journey | undefined): string | null {
  if (journey?.blocks == null) return null

  const cardBlocks = journey.blocks.filter(
    (block): block is CardBlock => block.__typename === 'CardBlock'
  )

  for (const card of cardBlocks) {
    const hasImages = journey.blocks.some(
      (block) =>
        block.__typename === 'ImageBlock' &&
        block.parentBlockId === card.id &&
        block.customizable === true
    )
    if (hasImages) return card.id
  }

  return null
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [selectedCardBlockId, setSelectedCardBlockId] = useState<string | null>(
    getFirstCardWithImages(journey)
  )
  const showLogo = showLogoSection()
  const showImages = showImagesSection(journey, selectedCardBlockId)
  const showVideos = showVideosSection(selectedCardBlockId)

  return (
    <Stack alignItems="center" sx={{ width: '100%' }}>
      <Typography
        variant="h4"
        gutterBottom
        display={{ xs: 'none', sm: 'block' }}
      >
        {t('Media')}
      </Typography>
      {showLogo && <LogoSection cardBlockId={selectedCardBlockId} />}
      {<CardsSection onChange={setSelectedCardBlockId} />}
      {showImages && (
        <ImagesSection journey={journey} cardBlockId={selectedCardBlockId} />
      )}
      {showVideos && <VideosSection cardBlockId={selectedCardBlockId} />}
      <CustomizeFlowNextButton
        label={t('Next')}
        onClick={handleNext}
        ariaLabel={t('Next')}
      />
    </Stack>
  )
}

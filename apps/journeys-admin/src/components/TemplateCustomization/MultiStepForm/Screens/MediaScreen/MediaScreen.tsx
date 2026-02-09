import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  showLogoSection,
  showImagesSection,
  showVideosSection,
  showBackgroundImageSection,
  showBackgroundVideoSection,
  getFirstCardWithImages
} from './utils'
import {
  BackgroundImageSection,
  BackgroundVideoSection,
  CardsSection,
  ImagesSection,
  LogoSection,
  VideosSection
} from './Sections'

import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

interface MediaScreenProps {
  handleNext: () => void
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [selectedCardBlockId] = useState<string | null>(
    getFirstCardWithImages(journey)
  )
  const showLogo = showLogoSection()
  const showImages = showImagesSection(journey, selectedCardBlockId)
  const showVideos = showVideosSection(selectedCardBlockId)
  const showBackgroundImage =
    showBackgroundImageSection(selectedCardBlockId)
  const showBackgroundVideo =
    showBackgroundVideoSection(selectedCardBlockId)

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
      {<CardsSection onChange={() => {}} />}
      {showImages && (
        <ImagesSection journey={journey} cardBlockId={selectedCardBlockId} />
      )}
      {showVideos && <VideosSection cardBlockId={selectedCardBlockId} />}
      {showBackgroundImage && (
        <BackgroundImageSection cardBlockId={selectedCardBlockId} />
      )}
      {showBackgroundVideo && (
        <BackgroundVideoSection cardBlockId={selectedCardBlockId} />
      )}
      <CustomizeFlowNextButton
        label={t('Next')}
        onClick={handleNext}
        ariaLabel={t('Next')}
      />
    </Stack>
  )
}

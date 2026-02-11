import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import {
  CardsSection,
  ImagesSection,
  LogoSection,
  VideosSection
} from './Sections'
import { showImagesSection, showLogoSection, showVideosSection } from './utils'

interface MediaScreenProps {
  handleNext: () => void
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [selectedCardBlockId, setSelectedCardBlockId] = useState<string | null>(
    null
  )
  const showLogo = showLogoSection()
  const showImages = showImagesSection(selectedCardBlockId)
  const showVideos = showVideosSection(journey, selectedCardBlockId)

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
      {showImages && <ImagesSection cardBlockId={selectedCardBlockId} />}
      {showVideos && <VideosSection cardBlockId={selectedCardBlockId} />}
      <CustomizeFlowNextButton
        label={t('Next')}
        onClick={handleNext}
        ariaLabel={t('Next')}
      />
    </Stack>
  )
}

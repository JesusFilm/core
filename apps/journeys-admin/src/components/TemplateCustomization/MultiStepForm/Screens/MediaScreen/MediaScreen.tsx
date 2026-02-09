import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import {
  BackgroundImageSection,
  BackgroundVideoSection,
  CardsSection,
  ImagesSection,
  LogoSection,
  VideosSection
} from './Sections'
import {
  showBackgroundImageSection,
  showBackgroundVideoSection,
  showImagesSection,
  showLogoSection,
  showVideosSection
} from './utils'

interface MediaScreenProps {
  handleNext: () => void
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedCardBlockId, setSelectedCardBlockId] = useState<string | null>(
    null
  )
  const showLogo = showLogoSection()
  const showImages = showImagesSection(selectedCardBlockId)
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
      {<CardsSection onChange={setSelectedCardBlockId} />}
      {showImages && <ImagesSection cardBlockId={selectedCardBlockId} />}
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

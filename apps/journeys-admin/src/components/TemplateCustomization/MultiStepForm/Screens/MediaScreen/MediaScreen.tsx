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
import { showImagesSection, showLogoSection, showVideosSection } from './utils'
import { transformer } from '@core/journeys/ui/transformer'
import { TreeBlock } from '@core/journeys/ui/block'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
import { TemplateCardPreview } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreview'
import { getJourneyMedia } from '../../../utils/getJourneyMedia'
import { getCustomizableMediaSteps } from './utils/mediaScreenUtils'

interface MediaScreenProps {
  handleNext: () => void
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [selectedCardBlockId, setSelectedCardBlockId] = useState<string | null>(
    null
  )
  const { journey } = useJourney()
  const showLogo = showLogoSection()
  const showImages = showImagesSection(selectedCardBlockId)
  const showVideos = showVideosSection(selectedCardBlockId)
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined

  const customizableMediaIds = getJourneyMedia(journey).map((media) => media.id)
  
  const customizableSteps = getCustomizableMediaSteps(
    steps ?? [],
    customizableMediaIds
  )
  const [selectedStep, setSelectedStep] = useState<TreeBlock<StepBlock>>(
    customizableSteps[0]
  )
  
  function handleStepClick(step: TreeBlock<StepBlock>): void {
    setSelectedStep(step)
  }
  return (
    <Stack alignItems="center" sx={{ width: '100%' }}>
      <Typography
        variant="h4"
        gutterBottom
        display={{ xs: 'none', sm: 'block' }}
      >
        {t('Media')}
      </Typography>
      <Box sx={{ width: '100%' }}>
        <TemplateCardPreview
          steps={customizableSteps}
          variant="media"
          onClick={handleStepClick}
          selectedStep={selectedStep}
        />
      </Box>
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

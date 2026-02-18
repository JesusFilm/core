import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

import { getJourneyMedia } from '../../../utils/getJourneyMedia'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'

import { CardsSection, ImagesSection, VideosSection } from './Sections'
import { showImagesSection, showLogoSection, showVideosSection } from './utils'
import {
  getCardBlockIdFromStep,
  getCustomizableMediaSteps
} from './utils/mediaScreenUtils'

interface MediaScreenProps {
  handleNext: () => void
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
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
  const [loading, setLoading] = useState(false)

  const [selectedCardBlockId, setSelectedCardBlockId] = useState<string | null>(
    getCardBlockIdFromStep(customizableSteps[0])
  )

  const showImages = showImagesSection(journey, selectedCardBlockId)
  const showVideos = showVideosSection(journey, selectedCardBlockId)

  useEffect(() => {
    if (customizableSteps.length > 0 && selectedStep == null) {
      setSelectedStep(customizableSteps[0])
      setSelectedCardBlockId(getCardBlockIdFromStep(customizableSteps[0]))
    }
  }, [customizableSteps, selectedStep])

  function handleStepClick(step: TreeBlock<StepBlock>): void {
    setSelectedStep(step)
    setSelectedCardBlockId(getCardBlockIdFromStep(step))
  }
  return (
    <Stack
      alignItems="center"
      sx={{
        width: '100%',
        px: { xs: 0, sm: 3.5 }
      }}
    >
      <Stack
        gap={4}
        sx={{
          width: '100%',
          px: { xs: 0, sm: 10 },
          overflow: { xs: 'visible', sm: 'hidden' }
        }}
      >
        {t('Media')}
      </Typography>
      {<CardsSection onChange={setSelectedCardBlockId} />}
      <Box sx={{ width: '100%' }}>
        <TemplateCardPreview
          steps={customizableSteps}
          variant="media"
          onClick={handleStepClick}
          selectedStep={selectedStep}
          handleStepClick={handleStepClick}
        />
      </Box>
      {showLogo && <LogoSection cardBlockId={selectedCardBlockId} />}
      {showImages && (
        <ImagesSection journey={journey} cardBlockId={selectedCardBlockId} />
      )}
      {showVideos && (
        <VideosSection
          cardBlockId={selectedCardBlockId}
          onLoading={setLoading}
        <CustomizeFlowNextButton
          label={t('Next')}
          onClick={handleNext}
          ariaLabel={t('Next')}
          disabled={loading}
        />
      </Stack>
    </Stack>
  )
}

import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

import { getJourneyMedia } from '../../../utils/getJourneyMedia'
import { CustomizeFlowNextButton } from '../../CustomizeFlowNextButton'
import { useTemplateVideoUpload } from '../../TemplateVideoUploadProvider'
import { ScreenWrapper } from '../ScreenWrapper'

import {
  CardsSection,
  ImagesSection,
  LogoSection,
  VideosSection
} from './Sections'
import { showImagesSection, showLogoSection, showVideosSection } from './utils'
import {
  getCardBlockIdFromStep,
  getCustomizableMediaSteps
} from './utils/mediaScreenUtils'
import Stack from '@mui/material/Stack'

interface MediaScreenProps {
  handleNext: (overrideJourneyId?: string) => void
}

export function MediaScreen({ handleNext }: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { hasActiveUploads } = useTemplateVideoUpload()
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

  const [selectedCardBlockId, setSelectedCardBlockId] = useState<string | null>(
    getCardBlockIdFromStep(customizableSteps[0])
  )

  const showLogo = showLogoSection(journey)
  const showImages = showImagesSection(journey, selectedCardBlockId)
  const showVideos = showVideosSection(journey, selectedCardBlockId)
  const showMediaLabels = showImages && showVideos

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
    <ScreenWrapper
      title={t('Media')}
      subtitle={t('Personalize and manage your media assets')}
      footer={
        <CustomizeFlowNextButton
          label={t('Next')}
          onClick={() => handleNext()}
          ariaLabel={t('Next')}
          loading={hasActiveUploads}
        />
      }
    >
      <Stack sx={{ width: '100%', gap: 6 }}>
        {showLogo && <LogoSection />}
        <CardsSection
          customizableSteps={customizableSteps}
          selectedStep={selectedStep}
          handleStepClick={handleStepClick}
          showLabel={journey?.website === true}
        />
        {showImages && (
          <ImagesSection
            journey={journey}
            cardBlockId={selectedCardBlockId}
            showLabel={showMediaLabels}
          />
        )}
        {showVideos && (
          <VideosSection
            cardBlockId={selectedCardBlockId}
            showLabel={showMediaLabels}
          />
        )}
      </Stack>
    </ScreenWrapper>
  )
}

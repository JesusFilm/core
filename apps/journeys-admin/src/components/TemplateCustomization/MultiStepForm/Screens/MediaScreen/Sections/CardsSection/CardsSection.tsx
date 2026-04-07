import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { TemplateCardPreview } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreview'
import { OVERFLOW_PX } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/templateCardPreviewConfig'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'

interface CardsSectionProps {
  customizableSteps: Array<TreeBlock<StepBlock>>
  selectedStep: TreeBlock<StepBlock>
  handleStepClick: (step: TreeBlock<StepBlock>) => void
  showLabel?: boolean
}

/**
 * Renders the Cards section in the Media screen template customization flow.
 * Displays customizable step cards via TemplateCardPreview and allows
 * selecting a step to customize.
 *
 * @param props - Component props
 * @param props.customizableSteps - List of step blocks available for customization
 * @param props.selectedStep - Currently selected step block
 * @param props.handleStepClick - Callback when a step card is clicked
 */
export function CardsSection({
  customizableSteps,
  selectedStep,
  handleStepClick,
  showLabel = false
}: CardsSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      direction="column"
      gap={4}
      data-testid="CardsSection"
      sx={{
        width: '100%',
        overflow: 'visible'
      }}
    >
      {showLabel && (
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          {t('Cards')}
        </Typography>
      )}
      <Box
        sx={{
          width: { xs: '100%', sm: `calc(100% + ${OVERFLOW_PX * 2}px)` },
          mx: { xs: 0, sm: `-${OVERFLOW_PX}px` }
        }}
      >
        <TemplateCardPreview
          steps={customizableSteps}
          variant="compact"
          onClick={handleStepClick}
          selectedStep={selectedStep}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
        {t('Tap to preview')}
      </Typography>
    </Stack>
  )
}

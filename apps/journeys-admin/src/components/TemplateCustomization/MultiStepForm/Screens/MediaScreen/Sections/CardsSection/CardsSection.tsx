import { TreeBlock } from '@core/journeys/ui/block'
import { TemplateCardPreview } from '@core/journeys/ui/TemplateView/TemplatePreviewTabs/TemplateCardPreview/TemplateCardPreview'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import Stack from '@mui/material/Stack'

interface CardsSectionProps {
  customizableSteps: Array<TreeBlock<StepBlock>>
  selectedStep: TreeBlock<StepBlock>
  handleStepClick: (step: TreeBlock<StepBlock>) => void
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
  handleStepClick
}: CardsSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      direction="column"
      gap={4}
      data-testid="CardsSection"
      sx={{
        width: '100%',
      }}
    >
      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        {t('Cards')}
      </Typography>
      <Box sx={{ width: '100%', px: {xs: 0, sm: 5}}}>
        <TemplateCardPreview
          steps={customizableSteps}
          variant="media"
          onClick={handleStepClick}
          selectedStep={selectedStep}
        />
      </Box>
    </Stack>
  )
}

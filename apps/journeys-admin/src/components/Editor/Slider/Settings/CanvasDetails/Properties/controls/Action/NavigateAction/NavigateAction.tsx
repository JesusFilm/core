import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { CardPreview } from '../../../../../../../../CardPreview'
import { getNextStep } from '../utils/getNextStep'

export function NavigateAction(): ReactElement {
  const {
    state: { steps, selectedStep }
  } = useEditor()

  const nextStep =
    steps?.find((step) => step.id === selectedStep?.nextBlockId) ??
    getNextStep(selectedStep, steps)

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Typography variant="caption" color="secondary.main" gutterBottom>
        {t('Default Next Step defined in the current card settings.')}
      </Typography>
      <Box
        sx={{
          display: 'absolute',
          backgroundColor: 'white',
          opacity: '40%'
        }}
        data-testid="NavigateAction"
      >
        <CardPreview
          selected={nextStep}
          steps={steps}
          testId="NavigateAction"
        />
      </Box>
    </>
  )
}

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { TranslationProgressBar } from '@core/journeys/ui/TranslationProgressBar'

import { useTranslationRun } from '../TranslationRunProvider'

interface TranslationRunProgressProps {
  'data-testid'?: string
}

/**
 * The full progress bar of the machine-translation run in flight, with
 * Cancel; nothing when none runs. Shown in every Localize tab so the run is
 * in view wherever the author switches to.
 */
export function TranslationRunProgress({
  'data-testid': testId = 'TranslationRunProgress'
}: TranslationRunProgressProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { run, cancel } = useTranslationRun()
  if (run == null) return null

  return (
    <Stack spacing={2} data-testid={testId} sx={{ alignItems: 'center' }}>
      <TranslationProgressBar
        progress={run.progress}
        message={run.message ?? t('Starting translation...')}
      />
      <Button variant="outlined" size="small" onClick={cancel}>
        {t('Cancel')}
      </Button>
    </Stack>
  )
}

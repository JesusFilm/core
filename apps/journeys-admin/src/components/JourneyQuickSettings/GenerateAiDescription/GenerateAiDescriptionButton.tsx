import AutoAwesome from '@mui/icons-material/AutoAwesome'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GenerateAiDescriptionDialog } from './GenerateAiDescriptionDialog'

export function GenerateAiDescriptionButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [open, setOpen] = useState(false)

  if (journey?.template !== true) {
    return <></>
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AutoAwesome />}
        onClick={() => setOpen(true)}
      >
        {t('Generate Description')}
      </Button>
      <GenerateAiDescriptionDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

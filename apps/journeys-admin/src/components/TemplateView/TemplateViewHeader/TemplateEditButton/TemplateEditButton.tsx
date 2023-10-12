import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { TemplateSettingsDialog } from '../../../JourneyView/TemplateSettings/TemplateSettingsDialog'

export function TemplateEditButton(): ReactElement {
  const { t } = useTranslation()
  const [showTemplateSettingsDialog, setTemplateSettingsDialog] =
    useState(false)

  const handleTemplateSettingsOpen = (): void => {
    setTemplateSettingsDialog(true)
  }

  return (
    <>
      <Button
        data-testid="EditTemplateSettings"
        size="small"
        onClick={handleTemplateSettingsOpen}
      >
        <Edit2Icon />
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, pl: '6px' }}>
          {t('Edit')}
        </Typography>
      </Button>
      <TemplateSettingsDialog
        open={showTemplateSettingsDialog}
        onClose={() => setTemplateSettingsDialog(false)}
      />
    </>
  )
}

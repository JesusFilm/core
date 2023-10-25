import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
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
        data-testid="EditTemplateSettingsButton"
        size="medium"
        onClick={handleTemplateSettingsOpen}
        startIcon={<Edit2Icon />}
        sx={{ display: { xs: 'none', sm: 'flex' } }}
      >
        {t('Edit')}
      </Button>
      <IconButton
        data-testid="EditTemplateSettingsIconButton"
        color="primary"
        sx={{ display: { xs: 'flex', sm: 'none' } }}
      >
        <Edit2Icon />
      </IconButton>
      <TemplateSettingsDialog
        open={showTemplateSettingsDialog}
        onClose={() => setTemplateSettingsDialog(false)}
      />
    </>
  )
}

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { TemplateSettingsDrawer } from '../../../JourneyView/TemplateSettings/TemplateSettingsDrawer'
import { TemplateSettingsForm } from '../../../JourneyView/TemplateSettings/TemplateSettingsForm'

export function TemplateEditButton(): ReactElement {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  return (
    <>
      <Button
        data-testid="EditTemplateSettings"
        size="small"
        onClick={handleOpen}
      >
        <Edit2Icon />
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, pl: '6px' }}>
          {t('Edit')}
        </Typography>
      </Button>
      <TemplateSettingsForm onSubmit={handleClose}>
        <TemplateSettingsDrawer open={open} onClose={handleClose} />
      </TemplateSettingsForm>
    </>
  )
}

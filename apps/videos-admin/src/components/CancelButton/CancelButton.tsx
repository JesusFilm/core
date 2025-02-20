import Button from '@mui/material/Button'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function CancelButton({ show, handleCancel }): ReactElement | null {
  const t = useTranslations()

  if (!show) {
    return null
  }

  return (
    <Button variant="outlined" size="small" onClick={handleCancel}>
      {t('Cancel')}
    </Button>
  )
}

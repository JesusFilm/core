import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function Suggestions(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <Typography variant="h6" color="primary.main" marginBottom={6}>
      {t('Suggestions')}
    </Typography>
  )
}

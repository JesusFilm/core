import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'
import Button from '@mui/material/Button'

export function SignUpButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Button variant="contained" color="primary">
      {t('Sign Up')}
    </Button>
  )
}

import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

export function UnpublishedVideoBanner(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Alert severity="warning" data-testid="UnpublishedVideoBanner">
      <AlertTitle>{t('Unpublished')}</AlertTitle>
      {t(
        'This video has not been published yet. It can still be added to a journey, but visitors will not be able to watch it until it is published.'
      )}
    </Alert>
  )
}

export default UnpublishedVideoBanner

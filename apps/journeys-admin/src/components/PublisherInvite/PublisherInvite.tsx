import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { AccessDenied } from '../AccessDenied'

export function PublisherInvite(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <AccessDenied
      title={t('You need access')}
      description={t('You need to be a publisher to view this template.')}
    />
  )
}

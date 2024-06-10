import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

function StrategiesPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return <div>{t('Strategies')}</div>
}

export default StrategiesPage

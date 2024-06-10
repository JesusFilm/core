import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

function AppsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return <div>{t('Apps')}</div>
}

export default AppsPage

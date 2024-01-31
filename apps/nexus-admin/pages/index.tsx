import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

export default function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-nexus-admin')
  return <h1>{t('Welcome to Nexus Admin')}</h1>
}

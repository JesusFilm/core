import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export default function IndexPage(): ReactElement {
  const { t } = useTranslation('apps-nexus-admin')
  return <h1>{t('Welcome to Nexus Admin')}</h1>
}

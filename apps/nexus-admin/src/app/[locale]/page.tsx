import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export default function Index(): ReactElement {
  const t = useTranslations()
  return <h1>{t('title')}</h1>
}

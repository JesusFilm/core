import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Logout } from './_Logout'

export default function Index(): ReactElement {
  const t = useTranslations()

  return (
    <div>
      <h1>{t('Nexus Admin')}</h1>
      <Logout />
    </div>
  )
}

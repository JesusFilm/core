import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { signOut } from '../../auth'

export default function Index(): ReactElement {
  const t = useTranslations()
  return (
    <div>
      <h1>{t('Nexus Admin')}</h1>
      <form
        action={async () => {
          'use server'
          await signOut()
        }}
      >
        <button type="submit">{t('Sign Out')}</button>
      </form>
    </div>
  )
}

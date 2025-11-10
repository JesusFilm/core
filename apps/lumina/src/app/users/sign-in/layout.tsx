import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

export async function generateMetadata() {
  const t = await getTranslations('SignInPage')
  const m = await getTranslations('Metadata')
  return {
    title: m('pageTitle', { title: t('title') }),
    description: t('description')
  }
}

export default function SignInLayout({
  children
}: {
  children: React.ReactNode
}): ReactElement {
  return <>{children}</>
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('SignUpPage')
  const m = await getTranslations('Metadata')
  return {
    title: m('pageTitle', { title: t('title') }),
    description: t('description')
  }
}

export default function SignUpLayout({
  children
}: {
  children: React.ReactNode
}): ReactElement {
  return <>{children}</>
}

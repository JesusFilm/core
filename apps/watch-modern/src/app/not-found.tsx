import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('NotFoundPage')
  const m = await getTranslations('Metadata')

  return {
    title: m('pageTitle', { title: t('title') })
  }
}

export default async function NotFound() {
  const t = await getTranslations('NotFoundPage')

  return <h1>{t('title')}</h1>
}

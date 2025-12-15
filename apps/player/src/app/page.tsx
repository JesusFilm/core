import { getTranslations } from 'next-intl/server'

export const generateMetadata = async () => {
  const t = await getTranslations('RootIndexPage')
  const m = await getTranslations('Metadata')
  return {
    title: m('pageTitle', { title: t('pageTitle') }),
    description: t('description')
  }
}

export default async function RootIndexPage() {
  const t = await getTranslations('RootIndexPage')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t('title')}</h1>
        <p className="text-text-secondary">{t('description')}</p>
      </div>
    </div>
  )
}

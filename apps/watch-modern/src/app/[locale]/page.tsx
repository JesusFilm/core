import { ReactElement } from 'react'

import { TranslationsProvider } from '../../components/TranslationProvider'
import initTranslations from '../i18n'

/**
 * Home page component for the watch-modern application
 * @returns {JSX.Element} The rendered home page
 */
export default async function Index({
  params: { locale }
}): Promise<ReactElement> {
  const { t, resources } = await initTranslations(locale, ['apps-watch-modern'])
  return (
    <TranslationsProvider
      namespaces={['apps-watch-modern']}
      locale={locale}
      resources={resources}
    >
      <main className="flex-1 py-8">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              {t('Welcome to Watch Modern')}
            </h2>
          </div>
          <div>
            <p className="text-gray-600">
              {t('Your modern streaming platform')}
            </p>
          </div>
        </div>
      </main>
    </TranslationsProvider>
  )
}

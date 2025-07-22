import { getTranslations } from 'next-intl/server'
import { ReactElement } from 'react'

import ServerExample from '../../components/ServerExample'

/**
 * Home page component for the watch-modern application
 * @returns {JSX.Element} The rendered home page
 */
export default async function Index(): Promise<ReactElement> {
  const t = await getTranslations('apps-watch-modern')

  return (
    <main className="flex-1 py-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{t('Welcome to Watch Modern')}</h2>
        </div>
        <div>
          <p className="text-gray-600">{t('Your modern streaming platform')}</p>
        </div>
      </div>
      <ServerExample />
    </main>
  )
}

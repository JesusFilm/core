import { getTranslations } from 'next-intl/server'
import { ReactElement } from 'react'

export default async function RootIndexPage(): Promise<ReactElement> {
  const t = await getTranslations('RootIndexPage')

  return (
    <main className="flex-1 py-8">
      <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{t('title')}</h2>
        </div>
        <div>
          <p className="text-gray-600">{t('description')}</p>
        </div>
      </div>
    </main>
  )
}

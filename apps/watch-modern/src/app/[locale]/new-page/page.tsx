import { getTranslations } from 'next-intl/server'
import { ReactElement } from 'react'

/**
 * New page component
 * @returns {ReactElement} The rendered new page
 */
export default async function NewPage(): Promise<ReactElement> {
  const t = await getTranslations('apps-watch-modern')
  return (
    <main className="flex-1 py-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">{t('New Page')}</h2>
      </div>
    </main>
  )
}

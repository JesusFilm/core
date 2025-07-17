'use client'

import { ReactElement } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useTranslation } from 'react-i18next'

/**
 * New page component
 * @returns {ReactElement} The rendered new page
 */
export default function NewPage(): ReactElement {
  const { t } = useTranslation('apps-watch-modern')
  return (
    <main className="flex-1 py-8">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">{t('New Page')}</h2>
      </div>
    </main>
  )
}

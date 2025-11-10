import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  try {
    const t = await getTranslations('Dashboard')
    const m = await getTranslations('Metadata')
    return {
      title: m('pageTitle', { title: t('analytics.title') }),
      description: t('analytics.description')
    }
  } catch {
    return {
      title: 'Analytics - Lumina AI',
      description: 'Analytics dashboard'
    }
  }
}

export default async function AnalyticsPage(): Promise<ReactElement> {
  let title = 'Analytics'
  let description = 'View your analytics and insights'

  try {
    const t = await getTranslations('Dashboard')
    title = t('analytics.title') || title
    description = t('analytics.description') || description
  } catch {
    // Use fallback values
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <p className="text-gray-600">
          Analytics dashboard content will be displayed here.
        </p>
      </div>
    </div>
  )
}

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import type { ReactElement } from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  try {
    const t = await getTranslations('Dashboard')
    const m = await getTranslations('Metadata')
    return {
      title: m('pageTitle', { title: t('agents.title') }),
      description: t('agents.description')
    }
  } catch {
    return {
      title: 'Agents - Lumina AI',
      description: 'Manage your agents'
    }
  }
}

export default async function AgentsPage(): Promise<ReactElement> {
  let title = 'Agents'
  let description = 'Manage your AI agents'

  try {
    const t = await getTranslations('Dashboard')
    title = t('agents.title') || title
    description = t('agents.description') || description
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
          Agents management content will be displayed here.
        </p>
      </div>
    </div>
  )
}


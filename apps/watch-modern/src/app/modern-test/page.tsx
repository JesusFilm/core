import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactElement } from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ModernTestPage')
  const m = await getTranslations('Metadata')

  return {
    title: m('pageTitle', { title: t('pageTitle') })
  }
}

export default async function ModernTestPage(): Promise<ReactElement> {
  const t = await getTranslations('ModernTestPage')

  return (
    <main className="container mx-auto flex-1 py-8">
      <div className="bg-card mb-6 rounded-lg border p-6 shadow-sm">
        <div className="mb-4">
          <h1 className="text-primary text-3xl font-bold">{t('title')}</h1>
        </div>
        <div className="mb-6">
          <p className="text-muted-foreground text-lg">{t('description')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              {t('feature1.title')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('feature1.description')}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              {t('feature2.title')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('feature2.description')}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              {t('feature3.title')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('feature3.description')}
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">{t('footer')}</p>
        </div>
      </div>
    </main>
  )
}

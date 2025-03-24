import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../PageWrapper'

import { ContainerHero } from './ContainerHero'

export function CollectionsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <PageWrapper hero={<ContainerHero />} hideHeader hideFooter>
      {/* <div className="container mx-auto py-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          {t('collections')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-background-paper rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-video bg-gray-200 rounded-md mb-4"></div>
            <h3 className="font-bold text-lg mb-1">{t('collectionTitle')}</h3>
            <p className="text-sm text-secondary-contrast opacity-70">
              {t('sampleDescription')}
            </p>
          </div>
        </div>
      </div> */}
    </PageWrapper>
  )
}

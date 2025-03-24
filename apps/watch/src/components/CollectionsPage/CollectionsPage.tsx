import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../PageWrapper'

import { ContainerHero } from './ContainerHero'

export function CollectionsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <PageWrapper hero={<ContainerHero />} hideHeader hideFooter>
      <div
        className="bg-stone-900 text-white min-h-screen font-sans"
        data-testid="CollectionPage"
      >
        <div
          className="w-full mx-auto z-1 border-t border-stone-500/30"
          data-testid="CollectionPageBlurFilter"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'brightness(.6) blur(40px)'
          }}
        >
          <div
            className="pt-7 w-full max-w-[1920px]"
            data-testid="CollectionPageContainer"
          >
            <div
              className="h-[10000px]"
              data-testid="CollectionPageContent"
            ></div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

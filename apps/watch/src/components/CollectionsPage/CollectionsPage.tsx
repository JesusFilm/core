import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageWrapper } from '../PageWrapper'

import { CollectionsPageContent } from './CollectionsPageContent'
import { ContainerHero } from './ContainerHero'

export function CollectionsPage(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <PageWrapper hero={<ContainerHero />} hideHeader hideFooter>
      <CollectionsPageContent />
    </PageWrapper>
  )
}

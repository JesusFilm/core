import { ReactElement } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useVideo } from '../../libs/videoContext'
import { CollectionsPageContent } from '../CollectionsPage/CollectionsPageContent'
import { PageWrapper } from '../PageWrapper'

import { ContentHero } from './ContentHero'

export function NewContentPage(): ReactElement {
  const { container, variant } = useVideo()
  const slug = container?.slug ?? variant?.slug

  return (
    <PageWrapper
      hero={<ContentHero />}
      headerThemeMode={ThemeMode.dark}
      hideHeader
      hideFooter
    >
      <CollectionsPageContent></CollectionsPageContent>
    </PageWrapper>
  )
}

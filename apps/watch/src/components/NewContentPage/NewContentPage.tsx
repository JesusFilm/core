import { ReactElement } from 'react'

import { ThemeMode } from '@core/shared/ui/themes'

import { useVideoChildren } from '../../libs/useVideoChildren'
import { useVideo } from '../../libs/videoContext'
import { CollectionsPageContent } from '../CollectionsPage/CollectionsPageContent'
import { PageWrapper } from '../PageWrapper'

import { Chapters } from './Chapters'
import { ContentHero } from './ContentHero'

export function NewContentPage(): ReactElement {
  const { container, variant } = useVideo()
  const slug = container?.slug ?? variant?.slug

  const { loading, children } = useVideoChildren(slug)

  const realChildren = children.filter((video) => video.variant !== null)

  return (
    <PageWrapper
      hero={<ContentHero />}
      headerThemeMode={ThemeMode.dark}
      hideHeader
      hideFooter
    >
      <CollectionsPageContent>
        <Chapters videos={realChildren} containerSlug={slug} />
      </CollectionsPageContent>
    </PageWrapper>
  )
}

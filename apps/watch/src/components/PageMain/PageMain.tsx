import { type ReactElement } from 'react'
import { Index } from 'react-instantsearch'

import { ThemeMode } from '@core/shared/ui/themes'

import { useAlgoliaRouter } from '../../libs/algolia/useAlgoliaRouter'
import { PlayerProvider } from '../../libs/playerContext'
import { WatchProvider } from '../../libs/watchContext'
import { Footer } from '../Footer'
import { LegacyHeader } from '../LegacyHeader'
import { SearchComponent } from '../SearchComponent'

import { CollectionsRail } from './CollectionsRail'
import { ContainerWithMedia } from './ContainerWithMedia'
import { SectionPromo } from './SectionPromo'
import { useWatchHeroCarousel } from './useWatchHeroCarousel'

interface PageMainProps {
  languageId?: string | undefined
}

function PageMainContent({ languageId }: PageMainProps): ReactElement {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <Index indexName={indexName}>
      <PageMainBody languageId={languageId} />
    </Index>
  )
}

function PageMainBody({ languageId }: PageMainProps): ReactElement {
  useAlgoliaRouter()

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''
  const {
    slides,
    loading,
    activeVideoId,
    activeVideo,
    currentMuxInsert,
    handleVideoSelect,
    handleMuxInsertComplete,
    handleSkipActiveVideo
  } = useWatchHeroCarousel({ locale: '529' })

  return (
    <div>
      <Index indexName={indexName}>
        <SearchComponent languageId={languageId} />
      </Index>
      <ContainerWithMedia
        slides={slides}
        activeVideoId={activeVideoId}
        activeVideo={activeVideo}
        currentMuxInsert={currentMuxInsert}
        loading={loading}
        onSelectSlide={handleVideoSelect}
        onMuxInsertComplete={handleMuxInsertComplete}
        onSkipActiveVideo={handleSkipActiveVideo}
      >
        <CollectionsRail languageId={languageId} />
        <SectionPromo />
      </ContainerWithMedia>
      <Footer />
    </div>
  )
}

export function PageMain({ languageId }: PageMainProps): ReactElement {
  return (
    <PlayerProvider>
      <WatchProvider>
        <PageMainContent languageId={languageId} />
      </WatchProvider>
    </PlayerProvider>
  )
}

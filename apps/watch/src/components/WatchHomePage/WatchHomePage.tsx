import { type ReactElement } from 'react'
import { Index } from 'react-instantsearch'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { useAlgoliaRouter } from '../../libs/algolia/useAlgoliaRouter'
import { PlayerProvider } from '../../libs/playerContext'
import { VideoCarouselProvider } from '../../libs/videoCarouselContext'
import { WatchProvider } from '../../libs/watchContext'
import { Header } from '../Header'
import { SearchComponent } from '../SearchComponent'

import { AboutProjectSection } from './AboutProjectSection'
import { CollectionsRail } from './CollectionsRail'
import { SectionLanguageMap } from './SectionLanguageMap'
import { SectionNewsletterSignup } from './SectionNewsletterSignup'
import { SectionPromo } from './SectionPromo'
import { SeeAllVideos } from './SeeAllVideos'
import { WatchHero } from './WatchHero'

interface WatchHomePageProps {
  languageId?: string | undefined
}

function WatchHomePageContent({
  languageId
}: WatchHomePageProps): ReactElement {
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <Index indexName={indexName}>
      <WatchHomePageBody languageId={languageId} />
    </Index>
  )
}

function WatchHomePageBody({ languageId }: WatchHomePageProps): ReactElement {
  useAlgoliaRouter()

  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

  return (
    <div>
      <Header
        themeMode={ThemeMode.dark}
        hideTopAppBar
        hideBottomAppBar
        hideSpacer
        showLanguageSwitcher
      />
      <Index indexName={indexName}>
        <SearchComponent languageId={languageId} />
      </Index>
      <WatchHero>
        <div
          data-testid="WatchHomePage"
          className="flex flex-col py-20 z-10 responsive-container"
        >
          <ThemeProvider
            themeName={ThemeName.website}
            themeMode={ThemeMode.dark}
            nested
          >
            {/* <SeeAllVideos /> */}
            {/* <AboutProjectSection /> */}
          </ThemeProvider>
        </div>
        <CollectionsRail languageId={languageId} />
        <SectionNewsletterSignup />
        <SectionLanguageMap />
        <SectionPromo />
      </WatchHero>
    </div>
  )
}

export function WatchHomePage({
  languageId
}: WatchHomePageProps): ReactElement {
  return (
    <PlayerProvider>
      <WatchProvider>
        <VideoCarouselProvider locale={languageId}>
          <WatchHomePageContent languageId={languageId} />
        </VideoCarouselProvider>
      </WatchProvider>
    </PlayerProvider>
  )
}

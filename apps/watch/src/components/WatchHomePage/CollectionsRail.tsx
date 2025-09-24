import dynamic from 'next/dynamic'
import { type ReactElement } from 'react'

import { collectionShowcaseSources } from '../CollectionsPage/collectionShowcaseConfig'

const SectionVideoCarousel = dynamic(
  () =>
    import('../SectionVideoCarousel').then((mod) => ({
      default: mod.SectionVideoCarousel
    })),
  { ssr: false }
)

const SectionVideoGrid = dynamic(
  () =>
    import('../SectionVideoGrid').then((mod) => ({
      default: mod.SectionVideoGrid
    })),
  { ssr: false }
)

interface CollectionsRailProps {
  languageId?: string
}

export function CollectionsRail({ languageId }: CollectionsRailProps): ReactElement {
  return (
    <>
      <SectionVideoCarousel
        id="home-collection-showcase"
        sources={collectionShowcaseSources}
        primaryCollectionId="LUMOCollection"
        subtitleOverride="Video Bible Collection"
        titleOverride="Discover the full story"
        descriptionOverride="Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings."
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid"
        sources={collectionShowcaseSources}
        primaryCollectionId="LUMOCollection"
        subtitleOverride="Video Bible Collection"
        titleOverride="Discover the full story (Grid View)"
        descriptionOverride="Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings."
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid-vertical"
        sources={collectionShowcaseSources}
        primaryCollectionId="LUMOCollection"
        subtitleOverride="Video Bible Collection"
        titleOverride="Discover the full story (Vertical Cards)"
        descriptionOverride="Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings."
        orientation="vertical"
        languageId={languageId}
      />
    </>
  )
}

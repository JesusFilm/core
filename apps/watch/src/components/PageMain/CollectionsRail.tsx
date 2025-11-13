import dynamic from 'next/dynamic'
import { type ReactElement } from 'react'

import {
  christmasAdventShowcaseSources,
  collectionShowcaseSources
} from '../PageCollections/collectionShowcaseConfig'

const SectionVideoCarousel = dynamic(
  () =>
    import(
      /* webpackChunkName: "watch-section-video-carousel" */
      '../SectionVideoCarousel'
    ).then((mod) => ({
      default: mod.SectionVideoCarousel
    })),
  { ssr: false }
)

const SectionVideoGrid = dynamic(
  () =>
    import(
      /* webpackChunkName: "watch-section-video-grid" */
      '../SectionVideoGrid'
    ).then((mod) => ({
      default: mod.SectionVideoGrid
    })),
  { ssr: false }
)

interface CollectionsRailProps {
  languageId?: string
}

export function CollectionsRail({
  languageId
}: CollectionsRailProps): ReactElement {
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
        showSequenceNumbers={true}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid-christmas-advent"
        sources={christmasAdventShowcaseSources}
        primaryCollectionId="ChristmasAdventCollection"
        subtitleOverride="Christmas Advent"
        titleOverride="Christmas Advent Countdown"
        descriptionOverride="Join our Advent journey with a daily video that builds anticipation for Christmas, exploring the hope, joy, and promise of Jesus' arrival."
        languageId={languageId}
        showSequenceNumbers={true}
        analyticsTag="home-christmas-advent-grid"
      />
      <SectionVideoGrid
        id="home-collection-bibleproject-advent"
        primaryCollectionId="11_Advent"
        subtitleOverride="Bible Project"
        orientation="vertical"
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-nua"
        primaryCollectionId="7_0-ncs"
        subtitleOverride="NUA Series"
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-nua-origins-worth"
        primaryCollectionId="7_Origins2Worth"
        subtitleOverride="Worth Series"
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

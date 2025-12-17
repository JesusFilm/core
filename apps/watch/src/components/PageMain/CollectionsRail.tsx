import { type ReactElement } from 'react'

import { SectionVideoCarousel } from '../SectionVideoCarousel'
import { SectionVideoGrid } from '../SectionVideoGrid'
import {
  christmasAdventShowcaseSources,
  collectionLumo,
  collectionShowcaseSources,
  newBelieverCourse
} from '../PageCollections/collectionShowcaseConfig'

interface CollectionsRailProps {
  languageId?: string
}

export function CollectionsRail({
  languageId
}: CollectionsRailProps): ReactElement {
  return (
    <>
      <SectionVideoCarousel
        id="home-video-gospels"
        sources={collectionShowcaseSources}
        subtitleOverride="Video Bible Collection"
        titleOverride="Discover the full story"
        descriptionOverride="Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings."
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid"
        sources={collectionShowcaseSources}
        subtitleOverride="Video Bible Collection"
        titleOverride="Scripture Told Through Film"
        descriptionOverride="Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings."
        languageId={languageId}
        showSequenceNumbers={true}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid-christmas-advent"
        sources={christmasAdventShowcaseSources}
        // primaryCollectionId="ChristmasAdventCollection"
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
        titleOverride="NUA Worth"
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-new-believer-course"
        sources={newBelieverCourse}
        subtitleOverride="Video Course"
        // titleOverride="Journey with Jesus"
        // descriptionOverride="Start your faith journey with this comprehensive course designed for new believers."
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid-vertical"
        sources={collectionLumo}
        // primaryCollectionId="LUMOCollection"
        subtitleOverride="Every Gospel, Told on Video"
        titleOverride="Scripture, Spoken Exactly as Written"
        descriptionOverride="Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings."
        orientation="vertical"
        languageId={languageId}
      />
    </>
  )
}

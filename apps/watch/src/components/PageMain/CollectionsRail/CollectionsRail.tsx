import { useTranslation } from 'next-i18next/pages'
import { type ReactElement } from 'react'

import {
  christmasAdventShowcaseSources,
  collectionLumo,
  collectionShowcaseSources,
  newBelieverCourse
} from '../../PageCollections/collectionShowcaseConfig'
import { SectionVideoCarousel } from '../../SectionVideoCarousel'
import { SectionVideoGrid } from '../../SectionVideoGrid'

interface CollectionsRailProps {
  languageId?: string
}

export function CollectionsRail({
  languageId
}: CollectionsRailProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <>
      <SectionVideoCarousel
        id="home-video-gospels"
        sources={collectionShowcaseSources}
        subtitleOverride={t('Video Bible Collection')}
        titleOverride={t('Discover the full story')}
        descriptionOverride={t(
          'Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings.'
        )}
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid"
        sources={collectionShowcaseSources}
        subtitleOverride={t('Video Bible Collection')}
        titleOverride={t('Scripture Told Through Film')}
        descriptionOverride={t(
          'Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings.'
        )}
        languageId={languageId}
        showSequenceNumbers={true}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid-christmas-advent"
        sources={christmasAdventShowcaseSources}
        // primaryCollectionId="ChristmasAdventCollection"
        subtitleOverride={t('Christmas Advent')}
        titleOverride={t('Christmas Advent Countdown')}
        descriptionOverride={t(
          "Join our Advent journey with a daily video that builds anticipation for Christmas, exploring the hope, joy, and promise of Jesus' arrival."
        )}
        languageId={languageId}
        showSequenceNumbers={true}
        analyticsTag="home-christmas-advent-grid"
      />
      <SectionVideoGrid
        id="home-collection-bibleproject-advent"
        primaryCollectionId="11_Advent"
        subtitleOverride={t('Bible Project')}
        orientation="vertical"
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-nua"
        primaryCollectionId="7_0-ncs"
        subtitleOverride={t('NUA Series')}
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-nua-origins-worth"
        primaryCollectionId="7_Origins2Worth"
        subtitleOverride={t('Worth Series')}
        titleOverride={t('NUA Worth')}
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-new-believer-course"
        sources={newBelieverCourse}
        subtitleOverride={t('Video Course')}
        // titleOverride="Journey with Jesus"
        // descriptionOverride="Start your faith journey with this comprehensive course designed for new believers."
        languageId={languageId}
      />
      <SectionVideoGrid
        id="home-collection-showcase-grid-vertical"
        sources={collectionLumo}
        // primaryCollectionId="LUMOCollection"
        subtitleOverride={t('Every Gospel, Told on Video')}
        titleOverride={t('Scripture, Spoken Exactly as Written')}
        descriptionOverride={t(
          'Explore our collection of videos and resources that bring the Bible to life through engaging stories and teachings.'
        )}
        orientation="vertical"
        languageId={languageId}
      />
    </>
  )
}

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactElement } from 'react'

import { useRefinementList } from 'react-instantsearch'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'
import { languageRefinementProps } from '@core/journeys/ui/algolia/SearchBarProvider'

import {
  type CoreVideo,
  transformAlgoliaVideos as transformItems
} from '../../../libs/algolia/transformAlgoliaVideos'
import { useLanguages } from '../../../libs/useLanguages'
import { useLatestVideos } from '../../../hooks/useLatestVideos'
import { VideoGrid, VideoGridProps } from '../VideoGrid'

export function AlgoliaVideoGrid({
  languageId,
  ...props
}: VideoGridProps & { languageId?: string | undefined }): ReactElement {
  const { items: languageFilters } = useRefinementList(languageRefinementProps)
  const { languages } = useLanguages()
  const {
    items: algoliaVideos,
    showMore,
    isLastPage,
    loading,
    noResults,
    sendEvent
  } = useAlgoliaVideos<CoreVideo>({ transformItems, languageId })

  const orientation = props.orientation ?? 'horizontal'
  const latestLimit = orientation === 'vertical' ? 10 : 8

  const refinedLanguageId = useMemo(() => {
    const refinedItem = languageFilters.find((item) => item.isRefined)
    if (refinedItem == null) return undefined

    const match = languages.find(
      (lang) => lang.englishName?.value === refinedItem.label
    )

    return match?.id
  }, [languageFilters, languages])

  // Track selected languages to persist them even when there are no results
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const lastSelectedRef = useRef<string[]>([])

  // Update selected languages when refinements change, but persist when no results
  useEffect(() => {
    const refinedItems = languageFilters.filter((item) => item.isRefined)
    const currentSelected = refinedItems.map((item) => item.label)

    // Always update the ref with current selections
    if (currentSelected.length > 0) {
      lastSelectedRef.current = currentSelected
    }

    // Update state with current selections, or keep previous if none selected
    // This ensures we show selected languages even when there are no results
    setSelectedLanguages(currentSelected.length > 0 ? currentSelected : lastSelectedRef.current)
  }, [languageFilters])

  const [activeLanguageId, setActiveLanguageId] = useState<string | undefined>(
    languageId
  )

  useEffect(() => {
    if (refinedLanguageId != null) {
      setActiveLanguageId(refinedLanguageId)
      return
    }

    if (!noResults) {
      setActiveLanguageId(languageId)
    }
  }, [refinedLanguageId, languageId, noResults])

  const { videos: latestVideos, loading: latestLoading } = useLatestVideos({
    languageId: activeLanguageId,
    limit: latestLimit,
    skip: !noResults || activeLanguageId == null
  })

  const handleClick =
    (videoId?: string) =>
    (event: MouseEvent): void => {
      event.stopPropagation()
      if (videoId == null) return
      const item = algoliaVideos.filter((item) => item.id === videoId)
      sendEvent('click', item, 'Video Clicked')
    }

  return (
    <VideoGrid
      videos={algoliaVideos}
      loading={loading}
      showMore={showMore}
      hasNextPage={!isLastPage}
      hasNoResults={noResults}
      onCardClick={handleClick}
      fallbackVideos={latestVideos}
      fallbackLoading={latestLoading}
      selectedLanguages={selectedLanguages}
      {...props}
    />
  )
}

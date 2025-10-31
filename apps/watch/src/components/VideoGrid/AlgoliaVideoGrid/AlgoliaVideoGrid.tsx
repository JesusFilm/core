import { useEffect, useMemo, useState, type MouseEvent, type ReactElement } from 'react'

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
      {...props}
    />
  )
}

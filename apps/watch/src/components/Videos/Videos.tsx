import { gql, useQuery } from '@apollo/client'
import { ReactElement, useEffect, useState } from 'react'

import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { GetVideos } from '../../../__generated__/GetVideos'
import { VideosFilter } from '../../../__generated__/globalTypes'
import { VideosCarousel } from './VideosCarousel/VideosCarousel'
import { VideosGrid } from './VideosGrid/VideosGrid'

export const GET_VIDEOS = gql`
  query GetVideos(
    $where: VideosFilter
    $offset: Int
    $limit: Int
    $languageId: ID
  ) {
    videos(where: $where, offset: $offset, limit: $limit) {
      id
      type
      image
      snippet(languageId: $languageId, primary: true) {
        value
      }
      title(languageId: $languageId, primary: true) {
        value
      }
      variant {
        duration
      }
      episodeIds
      slug(languageId: $languageId, primary: true) {
        value
      }
    }
  }
`

interface VideosProps {
  filter?: VideosFilter
  layout?: 'grid' | 'carousel'
  variant?: 'small' | 'large'
  limit?: number
  showLoadMore?: boolean
}

function isAtEnd(count: number, limit: number, previousCount: number): boolean {
  if (count === previousCount) return true
  return count % limit !== 0
}

export function Videos({
  layout = 'grid',
  filter = {},
  variant = 'large',
  limit = 8,
  showLoadMore = true
}: VideosProps): ReactElement {
  const languageContext = useLanguage()
  const [isEnd, setIsEnd] = useState(false)
  const [previousCount, setPreviousCount] = useState(0)
  const { data, loading, fetchMore } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      where: filter,
      offset: 0,
      limit: limit,
      languageId: languageContext?.id ?? '529'
    }
  })

  useEffect(() => {
    setIsEnd(isAtEnd(data?.videos.length ?? 0, limit, previousCount))
  }, [data?.videos.length, setIsEnd, limit, previousCount])

  const handleLoadMore = async (): Promise<void> => {
    if (isEnd) return

    setPreviousCount(data?.videos.length ?? 0)
    await fetchMore({
      variables: {
        offset: data?.videos.length ?? 0
      }
    })
  }

  return (
    <>
      {layout === 'carousel' && (
        <VideosCarousel
          videos={data?.videos ?? []}
          onLoadMore={handleLoadMore}
          loading={loading}
        />
      )}
      {layout === 'grid' && (
        <VideosGrid
          videos={data?.videos ?? []}
          onLoadMore={handleLoadMore}
          showLoadMore={showLoadMore}
          loading={loading}
          isEnd={isEnd}
        />
      )}
    </>
  )
}

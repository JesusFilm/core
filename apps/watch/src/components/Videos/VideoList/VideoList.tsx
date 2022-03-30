import { gql, useQuery } from '@apollo/client'

import { ReactElement, useState } from 'react'

import {
  GetVideos,
  GetVideos_videos
} from '../../../../__generated__/GetVideos'
import { VideosFilter } from '../../../../__generated__/globalTypes'
import { VideoListCarousel } from './Carousel/VideoListCarousel'
import { VideoListGrid } from './Grid/VideoListGrid'
import { VideoListList } from './List/VideoListList'

export const GET_VIDEOS = gql`
  query GetVideos($where: VideosFilter, $page: Int, $limit: Int) {
    videos(where: $where, page: $page, limit: $limit) {
      id
      image
      snippet {
        primary
        value
      }
      title {
        primary
        value
      }
      variant {
        duration
      }
    }
  }
`

interface VideoListProps {
  filter?: VideosFilter
  layout?: 'grid' | 'carousel' | 'list'
  variant?: 'small' | 'large'
}

export function VideoList({
  layout = 'list',
  filter = {},
  variant = 'large'
}: VideoListProps): ReactElement {
  const [page, setPage] = useState(1)
  const [isEnd, setIsEnd] = useState(false)
  const [videos, setVideos] = useState<GetVideos_videos[]>([])
  const limit = layout === 'grid' ? 20 : 8
  const { data, loading, refetch } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      where: filter,
      page: page,
      limit: limit
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setVideos([...videos, ...data.videos])
    }
  })
  const handleLoadMore = async (): Promise<void> => {
    if (isEnd) return

    setPage(page + 1)
    await refetch()
    if (data != null) {
      await setVideos([...videos, ...data.videos])
    } else {
      setIsEnd(true)
    }
  }

  return (
    <>
      {layout === 'carousel' && (
        <VideoListCarousel
          videos={videos}
          onLoadMore={handleLoadMore}
          loading={loading}
        />
      )}
      {layout === 'grid' && (
        <VideoListGrid
          videos={videos}
          onLoadMore={handleLoadMore}
          loading={loading}
          isEnd={isEnd}
        />
      )}
      {layout === 'list' && (
        <VideoListList
          videos={videos}
          onLoadMore={handleLoadMore}
          loading={loading}
          isEnd={isEnd}
          variant={variant}
        />
      )}
    </>
  )
}

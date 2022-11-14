import { ReactElement, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { gql, useQuery } from '@apollo/client'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { VideoSearch } from '../VideoSearch'
import { VideoList } from '../VideoList'
import { GetVideos } from '../../../../../__generated__/GetVideos'
import { VideoListProps } from '../VideoList/VideoList'

export const GET_VIDEOS = gql`
  query GetVideos($where: VideosFilter, $limit: Int!, $offset: Int!) {
    videos(where: $where, limit: $limit, offset: $offset) {
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
        id
        duration
      }
    }
  }
`

interface VideoFromLocalProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromLocal({
  onSelect
}: VideoFromLocalProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [videos, setVideos] = useState<VideoListProps['videos']>()
  const { loading, data, fetchMore } = useQuery<GetVideos>(GET_VIDEOS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: searchQuery === '' ? null : searchQuery
      }
    },
    onCompleted: (data) => {
      setVideos(
        data.videos.map((video) => ({
          id: video.id,
          title: video.title.find(({ primary }) => primary)?.value,
          description: video.snippet.find(({ primary }) => primary)?.value,
          image: video.image ?? '',
          duration: video.variant?.duration,
          source: VideoBlockSource.internal
        }))
      )
    }
  })
  const [hasMore, setHasMore] = useState(true)
  const handleFetchMore = async (): Promise<void> => {
    const response = await fetchMore({
      variables: {
        offset: data?.videos?.length ?? 0
      }
    })
    if (response.data?.videos?.length === 0) setHasMore(false)
  }

  useEffect(() => setHasMore(true), [searchQuery, setHasMore])

  return (
    <>
      <VideoSearch
        value={searchQuery}
        onChange={setSearchQuery}
        icon="search"
      />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {searchQuery === '' && (
          <Box sx={{ pb: 4, px: 6 }}>
            <Typography variant="overline" color="primary">
              Jesus Film Library
            </Typography>
            <Typography variant="h6">Featured Videos</Typography>
          </Box>
        )}
        <VideoList
          onSelect={onSelect}
          loading={loading}
          videos={videos}
          fetchMore={handleFetchMore}
          hasMore={hasMore}
        />
      </Box>
    </>
  )
}

import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GetVideos } from '../../../../../__generated__/GetVideos'
import {
  VideoBlockSource,
  VideoBlockUpdateInput,
  VideoLabel
} from '../../../../../__generated__/globalTypes'
import { VideoList } from '../VideoList'
import { VideoListProps } from '../VideoList/VideoList'
import { VideoSearch } from '../VideoSearch'

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
      variant(languageId: "529") {
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
  const { loading, fetchMore } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      offset: 0,
      limit: 5,
      where: {
        availableVariantLanguageIds: ['529'],
        title: searchQuery === '' ? null : searchQuery,
        labels: [
          VideoLabel.episode,
          VideoLabel.featureFilm,
          VideoLabel.segment,
          VideoLabel.shortFilm
        ]
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
  const { t } = useTranslation('apps-journeys-admin')
  const handleFetchMore = async (): Promise<void> => {
    const response = await fetchMore({
      variables: {
        offset: videos?.length ?? 0
      }
    })
    if (response.data?.videos?.length === 0) {
      setHasMore(false)
    } else {
      setVideos((prevVideos) => [
        ...(prevVideos ?? []),
        ...response.data.videos.map((video) => ({
          id: video.id,
          title: video.title.find(({ primary }) => primary)?.value,
          description: video.snippet.find(({ primary }) => primary)?.value,
          image: video.image ?? '',
          duration: video.variant?.duration,
          source: VideoBlockSource.internal
        }))
      ])
    }
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
              {t('Jesus Film Library')}
            </Typography>
            <Typography variant="h6">{t('Featured Videos')}</Typography>
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

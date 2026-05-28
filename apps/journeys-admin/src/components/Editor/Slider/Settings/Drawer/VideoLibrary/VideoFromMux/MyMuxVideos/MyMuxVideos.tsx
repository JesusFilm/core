import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import {
  GetMyMuxVideos,
  GetMyMuxVideosVariables,
  GetMyMuxVideos_getMyMuxVideos as MuxVideoNode
} from '../../../../../../../../../__generated__/GetMyMuxVideos'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../../__generated__/globalTypes'
import { LoadMoreButton } from '../../../ImageBlockEditor/LoadMoreButton'
import { VideoDetails } from '../../VideoDetails'

export const GET_MY_MUX_VIDEOS = gql`
  query GetMyMuxVideos($offset: Int, $limit: Int) {
    getMyMuxVideos(offset: $offset, limit: $limit) {
      id
      playbackId
      readyToStream
    }
  }
`

interface MyMuxVideosProps {
  selectedVideoId?: string | null
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
  uploading?: boolean
}

export const PAGE_SIZE = 10
const PEEK_LIMIT = PAGE_SIZE + 1

export function MyMuxVideos({
  selectedVideoId,
  onSelect,
  uploading
}: MyMuxVideosProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [previewVideo, setPreviewVideo] = useState<{
    id: string
    playbackId: string
  } | null>(null)
  const [pagesFetched, setPagesFetched] = useState(1)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyMuxVideos,
    GetMyMuxVideosVariables
  >(GET_MY_MUX_VIDEOS, {
    variables: { offset: 0, limit: PEEK_LIMIT },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const allVideos = data?.getMyMuxVideos ?? []
  const videos = allVideos.slice(0, pagesFetched * PAGE_SIZE)
  const hasMore = allVideos.length > pagesFetched * PAGE_SIZE

  const isEmpty =
    !loading && error == null && uploading !== true && videos.length === 0
  if (isEmpty) return null

  const handleClick = (video: MuxVideoNode): void => {
    setPreviewVideo({ id: video.id, playbackId: video.playbackId as string })
  }

  const handlePreviewClose = (): void => {
    setPreviewVideo(null)
  }

  const handlePreviewSelect = (block: VideoBlockUpdateInput): void => {
    onSelect(block, true)
    setPreviewVideo(null)
  }

  const handleLoadMore = async (): Promise<void> => {
    const result = await fetchMore({
      variables: { offset: pagesFetched * PAGE_SIZE, limit: PEEK_LIMIT }
    }).catch(() => null)
    if (result == null) return
    setPagesFetched((prev) => prev + 1)
  }

  return (
    <Stack sx={{ p: 6, gap: 2 }} data-testid="MyMuxVideos">
      <Typography variant="overline">{t('Your uploads')}</Typography>
      {error != null && (
        <Typography color="error" variant="body2" sx={{ pb: 1 }}>
          {t('Could not load your videos.')}
        </Typography>
      )}
      <ImageList gap={10} sx={{ overflowY: 'visible' }}>
        {uploading === true && (
          <ImageListItem
            data-testid="my-mux-video-uploading"
            sx={{
              aspectRatio: '1 / 1',
              borderRadius: 2,
              background: (theme) => theme.palette.divider,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress size={24} />
          </ImageListItem>
        )}
        {videos.map((video) => {
          const selected = selectedVideoId === video.id
          return (
            <ImageListItem
              key={video.id}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 2,
                background: (theme) => theme.palette.divider,
                outline: '2px solid',
                outlineOffset: 2,
                transition: (theme) =>
                  theme.transitions.create('outline-color'),
                outlineColor: (theme) =>
                  selected ? theme.palette.primary.main : 'transparent'
              }}
            >
              <ButtonBase
                data-testid={`my-mux-video-${video.id}`}
                aria-label={t('Select uploaded video')}
                aria-pressed={selected}
                onClick={() => handleClick(video)}
                disableRipple
                sx={{ width: '100%', height: '100%' }}
              >
                <Box
                  component="img"
                  src={`https://image.mux.com/${video.playbackId as string}/thumbnail.png?time=1`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2
                  }}
                />
              </ButtonBase>
            </ImageListItem>
          )
        })}
      </ImageList>
      <LoadMoreButton
        hasMore={hasMore}
        loading={loading || isFetchingMore}
        onClick={handleLoadMore}
      />
      {previewVideo != null && (
        <VideoDetails
          key={previewVideo.id}
          id={previewVideo.id}
          playbackId={previewVideo.playbackId}
          open
          source={VideoBlockSource.mux}
          onClose={handlePreviewClose}
          onSelect={handlePreviewSelect}
        />
      )}
    </Stack>
  )
}

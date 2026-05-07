import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
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

interface MyMuxVideosGridProps {
  selectedVideoId?: string | null
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
  uploading?: boolean
}

export const PAGE_SIZE = 9

export function MyMuxVideosGrid({
  selectedVideoId,
  onSelect,
  uploading
}: MyMuxVideosGridProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [previewVideo, setPreviewVideo] = useState<{
    id: string
    playbackId: string
  } | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyMuxVideos,
    GetMyMuxVideosVariables
  >(GET_MY_MUX_VIDEOS, {
    variables: { offset: 0, limit: PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    onCompleted: (result) => {
      setHasMore((result.getMyMuxVideos ?? []).length >= PAGE_SIZE)
    }
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const videos = (data?.getMyMuxVideos ?? [])
    .filter(
      (node): node is MuxVideoNode =>
        node != null && node.readyToStream && node.playbackId != null
    )
    .map((node) => ({
      id: node.id,
      playbackId: node.playbackId as string,
      thumbnail: `https://image.mux.com/${node.playbackId as string}/thumbnail.png?time=1`
    }))

  if (!loading && error == null && videos.length === 0 && uploading !== true) {
    return null
  }

  const handleClick = (video: { id: string; playbackId: string }): void => {
    setPreviewVideo({ id: video.id, playbackId: video.playbackId })
  }

  const handlePreviewClose = (): void => {
    setPreviewVideo(null)
  }

  const handlePreviewSelect = (block: VideoBlockUpdateInput): void => {
    onSelect(block, true)
    setPreviewVideo(null)
  }

  const handleLoadMore = (): void => {
    void fetchMore({
      variables: { offset: videos.length, limit: PAGE_SIZE }
    }).then((result) => {
      setHasMore((result.data?.getMyMuxVideos ?? []).length >= PAGE_SIZE)
    })
  }

  return (
    <Stack sx={{ px: 6, pb: 4, pt: 2 }} data-testid="MyMuxVideosGrid">
      <Typography
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: '#6D6D7D',
          pb: 1
        }}
      >
        {t('Your uploads')}
      </Typography>
      {error != null && (
        <Typography color="error" variant="body2">
          {t('Could not load your videos.')}
        </Typography>
      )}
      <Box
        sx={{
          maxHeight: { xs: 220, sm: 300 },
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 3
          }
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}
        >
          {uploading === true && (
            <Box
              data-testid="my-mux-video-uploading"
              sx={{
                position: 'relative',
                background: (theme) => theme.palette.divider,
                borderRadius: 2,
                overflow: 'hidden',
                aspectRatio: '1 / 1'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={20} />
                <Typography
                  sx={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'text.secondary'
                  }}
                >
                  {t('Processing')}
                </Typography>
              </Box>
              <LinearProgress
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0
                }}
              />
            </Box>
          )}
          {videos.map((video) => {
            const isSelected = selectedVideoId === video.id
            return (
              <Box
                key={video.id}
                data-testid={`my-mux-video-${video.id}`}
                sx={{
                  position: 'relative',
                  aspectRatio: '1 / 1',
                  borderRadius: 2,
                  overflow: 'hidden',
                  outline: isSelected ? '2px solid' : 'none',
                  outlineColor: 'error.main',
                  outlineOffset: 0,
                  background: (theme) => theme.palette.divider
                }}
              >
                <ButtonBase
                  onClick={() => handleClick(video)}
                  aria-label={t('Select uploaded video')}
                  sx={{ width: '100%', height: '100%', display: 'block' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      opacity: 0,
                      transition: 'opacity 0.5s'
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.opacity = '1'
                    }}
                  />
                </ButtonBase>
              </Box>
            )
          })}
        </Box>
      </Box>
      {hasMore && videos.length > 0 && (
        <Button
          variant="outlined"
          onClick={handleLoadMore}
          disabled={isFetchingMore}
          size="small"
          sx={{
            mt: 2,
            alignSelf: 'flex-start',
            height: 32,
            borderRadius: '8px',
            borderColor: 'grey.300',
            color: 'grey.800'
          }}
        >
          {isFetchingMore ? t('Loading...') : t('Load More')}
        </Button>
      )}
      {!hasMore && videos.length >= PAGE_SIZE && (
        <Button
          variant="outlined"
          disabled
          size="small"
          sx={{
            mt: 2,
            alignSelf: 'flex-start',
            height: 32,
            borderRadius: '8px',
            borderColor: 'grey.300',
            color: 'grey.500'
          }}
        >
          {t('No more to load')}
        </Button>
      )}
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

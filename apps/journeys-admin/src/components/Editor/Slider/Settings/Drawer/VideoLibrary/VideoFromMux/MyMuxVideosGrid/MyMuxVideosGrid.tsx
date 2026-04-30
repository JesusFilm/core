import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

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

interface MuxVideoNode {
  id: string
  playbackId: string | null
  readyToStream: boolean
}

interface GetMyMuxVideosData {
  getMyMuxVideos: MuxVideoNode[]
}

interface GetMyMuxVideosVariables {
  offset?: number
  limit?: number
}

interface MyMuxVideosGridProps {
  title: string
  selectedVideoId?: string | null
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
  uploading?: boolean
}

const PAGE_SIZE = 9

export function MyMuxVideosGrid({
  title,
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
    GetMyMuxVideosData,
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

  if (!loading && error == null && videos.length === 0 && uploading !== true)
    return null

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

  return (
    <Stack sx={{ px: 6, pb: 4, pt: 2 }} data-testid="MyMuxVideosGrid">
      <Typography variant="overline" color="primary" sx={{ pb: 1 }}>
        {title}
      </Typography>
      {error != null && (
        <Typography color="error" variant="body2">
          {t('Could not load your videos.')}
        </Typography>
      )}
      <ImageList gap={8} cols={3} sx={{ overflowY: 'visible', m: 0 }}>
        {uploading === true && (
          <ImageListItem
            data-testid="my-mux-video-uploading"
            sx={{
              background: (theme) => theme.palette.divider,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                aspectRatio: '1/1',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          </ImageListItem>
        )}
        {videos.map((video) => (
          <ImageListItem
            key={video.id}
            data-testid={`my-mux-video-${video.id}`}
            sx={{
              background: (theme) => theme.palette.divider,
              outline: '2px solid',
              transition: (theme) => theme.transitions.create('outline-color'),
              outlineColor: (theme) =>
                selectedVideoId === video.id
                  ? theme.palette.primary.main
                  : 'transparent',
              borderRadius: 2,
              outlineOffset: 2,
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <ButtonBase
              onClick={() => handleClick(video)}
              aria-label={t('Select uploaded video')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnail}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  transition: 'opacity 0.5s'
                }}
                onLoad={(event) => {
                  event.currentTarget.style.opacity = '1'
                }}
              />
            </ButtonBase>
          </ImageListItem>
        ))}
      </ImageList>
      {hasMore && (
        <Button
          variant="outlined"
          onClick={() =>
            void fetchMore({
              variables: { offset: videos.length, limit: PAGE_SIZE }
            }).then((result) => {
              setHasMore(
                (result.data?.getMyMuxVideos ?? []).length >= PAGE_SIZE
              )
            })
          }
          loading={isFetchingMore}
          disabled={isFetchingMore}
          startIcon={<Plus2Icon />}
          size="medium"
          sx={{ mt: 4 }}
        >
          {isFetchingMore ? t('Loading...') : t('Load More')}
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

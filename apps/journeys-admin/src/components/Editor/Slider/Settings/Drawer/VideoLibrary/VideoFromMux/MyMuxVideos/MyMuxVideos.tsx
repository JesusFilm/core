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
import { useAuth } from '../../../../../../../../libs/auth'
import { sendVideoSelectEvent } from '../../../../../../../../libs/sendMediaSelectEvent'
import { LoadMoreButton } from '../../../ImageBlockEditor/LoadMoreButton'
import { VideoDetails } from '../../VideoDetails'

export const GET_MY_MUX_VIDEOS = gql`
  query GetMyMuxVideos($offset: Int, $limit: Int, $teamId: ID) {
    getMyMuxVideos(offset: $offset, limit: $limit, teamId: $teamId) {
      id
      playbackId
      readyToStream
      duration
      userId
    }
  }
`

interface MyMuxVideosProps {
  selectedVideoId?: string | null
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
  uploading?: boolean
  /**
   * Active team id. When provided, the grid shows a merged feed of the caller's
   * own uploads plus videos shared with the team. When null/undefined the query
   * omits the arg and degrades to personal-only.
   */
  teamId?: string | null
}

export const PAGE_SIZE = 10
const PEEK_LIMIT = PAGE_SIZE + 1

export function MyMuxVideos({
  selectedVideoId,
  onSelect,
  uploading,
  teamId
}: MyMuxVideosProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const [previewVideo, setPreviewVideo] = useState<{
    id: string
    playbackId: string
    duration: number | null
  } | null>(null)
  const [pagesFetched, setPagesFetched] = useState(1)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyMuxVideos,
    GetMyMuxVideosVariables
  >(GET_MY_MUX_VIDEOS, {
    // Omit teamId entirely when there's no active team so the resolver returns
    // personal-only results and the cache key matches the personal entry.
    variables: { offset: 0, limit: PEEK_LIMIT, teamId: teamId ?? undefined },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const hasPlaybackId = (
    video: MuxVideoNode
  ): video is MuxVideoNode & { playbackId: string } => video.playbackId != null

  const allVideos = (data?.getMyMuxVideos ?? []).filter(hasPlaybackId)
  const videos = allVideos.slice(0, pagesFetched * PAGE_SIZE)
  const hasMore = allVideos.length > pagesFetched * PAGE_SIZE

  const isEmpty =
    !loading && error == null && uploading !== true && videos.length === 0
  if (isEmpty) return null

  const handleClick = (video: MuxVideoNode & { playbackId: string }): void => {
    setPreviewVideo({
      id: video.id,
      playbackId: video.playbackId,
      duration: video.duration ?? null
    })
  }

  const handlePreviewClose = (): void => {
    setPreviewVideo(null)
  }

  const handlePreviewSelect = (block: VideoBlockUpdateInput): void => {
    sendVideoSelectEvent()
    // Reset endAt/duration to the selected video's full length. Without this the
    // stale endAt from a previously selected (longer) video carries over and the
    // VideoBlockEditorSettings validation rejects it with an "End time has to be
    // no more than video duration" snackbar.
    const duration = previewVideo?.duration
    const nextBlock =
      duration != null && duration > 0
        ? { ...block, duration, endAt: duration }
        : block
    onSelect(nextBlock, true)
    setPreviewVideo(null)
  }

  const handleLoadMore = async (): Promise<void> => {
    const result = await fetchMore({
      variables: {
        offset: pagesFetched * PAGE_SIZE,
        limit: PEEK_LIMIT,
        teamId: teamId ?? undefined
      }
    }).catch(() => null)
    if (result == null) return
    setPagesFetched((prev) => prev + 1)
  }

  return (
    <Stack sx={{ p: 6, gap: 2 }} data-testid="MyMuxVideos">
      <Typography variant="overline">{t('Uploads')}</Typography>
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
          // A tile belongs to a teammate when its uploader differs from the
          // current user. video.userId and the auth-context id are both the
          // firebase uid, so they compare directly. Drives the "Team" tag.
          const isTeamUpload = user?.id != null && video.userId !== user.id
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
                aria-label={
                  isTeamUpload
                    ? t('Select video uploaded by a teammate')
                    : t('Select uploaded video')
                }
                aria-pressed={selected}
                onClick={() => handleClick(video)}
                disableRipple
                sx={{ width: '100%', height: '100%' }}
              >
                <Box
                  component="img"
                  src={`https://image.mux.com/${video.playbackId}/thumbnail.png?time=1`}
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
              {isTeamUpload && (
                <Box
                  aria-hidden
                  data-testid={`my-mux-video-team-tag-${video.id}`}
                  sx={{
                    position: 'absolute',
                    right: 6,
                    bottom: 6,
                    zIndex: 2,
                    px: '7px',
                    py: '4px',
                    borderRadius: '5px',
                    pointerEvents: 'none',
                    fontFamily: 'inherit',
                    fontSize: 10,
                    fontWeight: 600,
                    lineHeight: 1,
                    letterSpacing: '0.04em',
                    color: 'common.white',
                    backgroundColor: 'rgba(24, 24, 32, 0.72)',
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  {t('Team')}
                </Box>
              )}
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

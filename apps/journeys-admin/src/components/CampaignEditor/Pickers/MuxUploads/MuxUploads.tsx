import { NetworkStatus } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import {
  GetMyMuxVideos,
  GetMyMuxVideosVariables
} from '../../../../../__generated__/GetMyMuxVideos'
import { useAuth } from '../../../../libs/auth'
import { sendVideoSelectEvent } from '../../../../libs/sendMediaSelectEvent'
import { LoadMoreButton } from '../../../Editor/Slider/Settings/Drawer/ImageBlockEditor/LoadMoreButton'
import { MediaLibraryTeamTag } from '../../../Editor/Slider/Settings/Drawer/ImageBlockEditor/MediaLibraryTeamTag'
import { GET_MY_MUX_VIDEOS } from '../../../Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux/MyMuxVideos'

interface MuxUploadsProps {
  /** The campaign's team: its shared uploads are listed with the author's own. */
  teamId: string
  /** The Mux asset id the author picked. */
  onPick: (videoId: string) => void
  testId?: string
}

const PAGE_SIZE = 10
const PEEK_LIMIT = PAGE_SIZE + 1

/**
 * The team's earlier video uploads as a grid of thumbnails, the journey
 * editor's `GetMyMuxVideos` feed without its preview dialog (that dialog
 * needs a journey): a click picks the video at once. Nothing renders until
 * there is an upload to show.
 */
export function MuxUploads({
  teamId,
  onPick,
  testId = 'CampaignMuxUploads'
}: MuxUploadsProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const [pagesFetched, setPagesFetched] = useState(1)
  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyMuxVideos,
    GetMyMuxVideosVariables
  >(GET_MY_MUX_VIDEOS, {
    variables: { offset: 0, limit: PEEK_LIMIT, teamId },
    notifyOnNetworkStatusChange: true
  })
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore
  const all = (data?.getMyMuxVideos ?? []).filter(
    (video): video is typeof video & { playbackId: string } =>
      video.playbackId != null && video.readyToStream
  )
  const videos = all.slice(0, pagesFetched * PAGE_SIZE)
  const hasMore = all.length > pagesFetched * PAGE_SIZE

  if (!loading && error == null && videos.length === 0) return null

  async function handleLoadMore(): Promise<void> {
    const result = await fetchMore({
      variables: { offset: pagesFetched * PAGE_SIZE, limit: PEEK_LIMIT, teamId }
    }).catch(() => null)
    if (result == null) return
    setPagesFetched((previous) => previous + 1)
  }

  return (
    <Stack spacing={2} data-testid={testId}>
      <Typography variant="overline">{t('Your uploads')}</Typography>
      {error != null && (
        <Typography color="error" variant="body2">
          {t('Could not load your videos.')}
        </Typography>
      )}
      <ImageList gap={10} sx={{ overflowY: 'visible', m: 0 }}>
        {videos.map((video) => {
          const isTeamUpload = user?.id != null && video.userId !== user.id
          return (
            <ImageListItem
              key={video.id}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 2,
                background: (theme) => theme.palette.divider
              }}
            >
              <ButtonBase
                data-testid={`${testId}-${video.id}`}
                aria-label={
                  isTeamUpload
                    ? t('Use video uploaded by a teammate')
                    : t('Use uploaded video')
                }
                onClick={() => {
                  sendVideoSelectEvent()
                  onPick(video.id)
                }}
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
                <MediaLibraryTeamTag
                  data-testid={`${testId}-team-tag-${video.id}`}
                />
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
    </Stack>
  )
}

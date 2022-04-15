import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { ReactElement } from 'react'
import { secondsToTimeFormat } from '@core/shared/ui'
import AddRounded from '@mui/icons-material/AddRounded'
import ListItem from '@mui/material/ListItem'
import Link from 'next/link'

import { VideoType } from '../../../../../__generated__/globalTypes'
import { GetVideos_videos } from '../../../../../__generated__/GetVideos'

interface VideoListListProps {
  videos: GetVideos_videos[]
  variant?: 'small' | 'large' | undefined
  loading?: boolean | undefined
  isEnd?: boolean | undefined
  routePrefix?: string | undefined
  onLoadMore?: () => Promise<void> | undefined
}

export function VideoListList({
  videos,
  loading = false,
  variant = 'large',
  isEnd = false,
  onLoadMore = undefined,
  routePrefix = undefined
}: VideoListListProps): ReactElement {
  return (
    <List data-testid="video-list-list">
      {(videos.length ?? 0) > 0 &&
        videos.map((video, index) => {
          const snippet = video.snippet.find(
            (snippet) => snippet.primary
          )?.value
          const title = video.title.find((title) => title.primary)?.value
          const href =
            routePrefix == null
              ? `/${video.permalink as string}`
              : `/${routePrefix}/${video.permalink as string}`
          return (
            <Link key={index} href={href} passHref={true}>
              <ListItem button component="a">
                <ListItemText
                  primary={title}
                  secondary={snippet}
                  secondaryTypographyProps={{
                    style: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      paddingRight: '2rem'
                    }
                  }}
                />
                {video.image != null && (
                  <Box>
                    <Box
                      data-testid={`video-list-list-image-${variant}`}
                      sx={{
                        justifySelf: 'end',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        height: variant === 'small' ? 79 : 150,
                        width: variant === 'small' ? 79 : 150,
                        borderRadius: 2,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundImage: `url(${video.image})`
                      }}
                    >
                      <Typography
                        component="div"
                        variant="caption"
                        sx={{
                          color: 'background.paper',
                          backgroundColor: 'rgba(0, 0, 0, 0.35)',
                          px: 1,
                          borderRadius: 2
                        }}
                      >
                        {video.type !== VideoType.playlist &&
                          secondsToTimeFormat(video.variant?.duration ?? 0)}
                        {video.type === VideoType.playlist &&
                          `${video.episodeIds.length} episodes`}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </ListItem>
            </Link>
          )
        })}
      {loading &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <ListItemButton key={index} data-testid="video-list-list-placeholder">
            <LinearProgress />
            <Box>
              <Box
                sx={{
                  justifySelf: 'end',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  height: variant === 'small' ? 79 : 150,
                  width: variant === 'small' ? 79 : 150,
                  borderRadius: 2,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundImage: `url(/loading-blurhash.png)`
                }}
              />
            </Box>
          </ListItemButton>
        ))}
      {onLoadMore != null && (
        <LoadingButton
          data-testid="VideoListLoadMore"
          variant="outlined"
          onClick={onLoadMore}
          loading={loading}
          startIcon={
            (videos?.length ?? 0) > 0 && !isEnd ? null : <AddRounded />
          }
          disabled={(videos?.length ?? 0) === 0 || isEnd}
          loadingPosition="start"
          size="medium"
        >
          {loading && 'Loading...'}
          {!loading &&
            ((videos?.length ?? 0) > 0 && !isEnd
              ? 'Load More'
              : 'No More Videos')}
        </LoadingButton>
      )}
    </List>
  )
}

import {
  Box,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material'
import { ReactElement } from 'react'
import { secondsToTimeFormat } from '@core/shared/ui'

import { GetVideos_videos } from '../../../../../__generated__/GetVideos'

interface VideoListListProps {
  videos: GetVideos_videos[]
  variant?: 'small' | 'large'
  loading?: boolean
  isEnd?: boolean
  onLoadMore: () => Promise<void>
}

export function VideoListList({
  videos,
  loading = false,
  variant,
  isEnd,
  onLoadMore
}: VideoListListProps): ReactElement {
  return (
    <List>
      {(videos.length ?? 0) > 0 &&
        videos.map((video, index) => (
          <ListItemButton key={index}>
            <ListItemText primary={video.title} secondary={video.snippet} />
            {video.image != null && (
              <Box>
                <Box
                  sx={{
                    justifySelf: 'end',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    height: 79,
                    width: 79,
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
                    {secondsToTimeFormat(video.variant?.duration ?? 0)}
                  </Typography>
                </Box>
              </Box>
            )}
          </ListItemButton>
        ))}
      {loading &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <ListItemButton key={index}>
            <LinearProgress />
            <Box>
              <Box
                sx={{
                  justifySelf: 'end',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  height: 79,
                  width: 79,
                  borderRadius: 2,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  backgroundImage: `url(/loading-blurhash.png)`
                }}
              />
            </Box>
          </ListItemButton>
        ))}
    </List>
  )
}

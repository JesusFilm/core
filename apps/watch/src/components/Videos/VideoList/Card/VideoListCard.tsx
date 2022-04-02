import { ReactElement } from 'react'
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  LinearProgress,
  Typography
} from '@mui/material'
import { secondsToTimeFormat } from '@core/shared/ui'

import { GetVideos_videos } from '../../../../../__generated__/GetVideos'

interface VideoListCardProps {
  video?: GetVideos_videos
  disabled?: boolean
}

export function VideoListCard({
  video,
  disabled = false
}: VideoListCardProps): ReactElement {
  return (
    <Card sx={{ width: 300, height: 315, my: 5, mr: 20 }}>
      {video == null && (
        <>
          <CardMedia
            component="img"
            image="/loading-blurhash.png"
            height="140"
          />
          <CardContent>
            <LinearProgress />
          </CardContent>
        </>
      )}
      {video != null && (
        <CardActionArea>
          <CardMedia component="img" image={video.image ?? ''} height="140" />
          <CardContent>
            <Typography variant="subtitle2">{video.title[0].value}</Typography>
            {video.playlist == null && (
              <Typography variant="caption">
                {secondsToTimeFormat(video.variant?.duration ?? 0)}
              </Typography>
            )}
            {video.playlist != null && video.playlist.length > 0 && (
              <Typography variant="caption">
                {video.playlist.length} episodes
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      )}
    </Card>
  )
}

import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
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
            <Typography variant="caption">
              {secondsToTimeFormat(video.variant?.duration ?? 0)}
            </Typography>
          </CardContent>
        </CardActionArea>
      )}
    </Card>
  )
}

import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { secondsToTimeFormat } from '@core/shared/ui'
import Link from 'next/link'

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
    <>
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
          <Link href={`/${video.permalink}`} passHref={true}>
            <CardActionArea>
              <CardMedia
                component="img"
                image={video.image ?? ''}
                height="140"
              />
              <CardContent>
                <Typography variant="subtitle2">
                  {video.title[0].value}
                </Typography>
                {video.episodeIds.length === 0 && (
                  <Typography variant="caption">
                    {secondsToTimeFormat(video.variant?.duration ?? 0)}
                  </Typography>
                )}
                {video.episodeIds.length > 0 && (
                  <Typography variant="caption">
                    {video.episodeIds.length} episodes
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Link>
        )}
      </Card>
    </>
  )
}

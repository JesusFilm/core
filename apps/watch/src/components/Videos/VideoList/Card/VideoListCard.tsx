import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import PlayArrow from '@mui/icons-material/PlayArrow'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import Link from 'next/link'
import Stack from '@mui/material/Stack'

import { VideoType } from '../../../../../__generated__/globalTypes'
import { GetVideos_videos } from '../../../../../__generated__/GetVideos'
import { theme } from '../../../ThemeProvider/ThemeProvider'

interface VideoListCardProps {
  video?: GetVideos_videos
  disabled?: boolean
  routePrefix?: string | undefined
}

export function VideoListCard({
  video,
  disabled = false,
  routePrefix = undefined
}: VideoListCardProps): ReactElement {
  return (
    <>
      <Card sx={{ width: 338, height: 140, my: 5, mr: 20, mb: '14px', mt: 0 }}>
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
          <Link
            href={`/${
              routePrefix == null
                ? `/${video.slug[0]?.value ?? ''}`
                : `/${routePrefix}/${video.slug[0]?.value ?? ''}`
            }`}
            passHref={true}
          >
            <CardActionArea>
              <Box sx={{ position: 'relative', alignContent: 'end' }}>
                <CardMedia
                  component="img"
                  image={video.image ?? ''}
                  height="140"
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: theme.palette.primary.contrastText,
                    borderRadius: '8px',
                    padding: '5px'
                  }}
                >
                  {video.type !== VideoType.playlist && (
                    <Stack direction="row">
                      <PlayArrow sx={{ fontSize: '1rem' }} />
                      <Typography variant="body1" sx={{ lineHeight: '16px' }}>
                        {secondsToTimeFormat(video.variant?.duration ?? 0)}
                      </Typography>
                    </Stack>
                  )}
                  {video.type === VideoType.playlist && (
                    <Typography variant="body1">
                      {video.episodeIds.length} episodes
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardActionArea>
          </Link>
        )}
      </Card>
      <Link href={`/${video?.slug[0]?.value ?? ''}`} passHref={true}>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 338,
            whiteSpace: 'nowrap',
            overflow: 'none',
            textOverflow: 'ellipsis',
            cursor: 'pointer'
          }}
          mb={3}
        >
          {video?.title[0]?.value}
        </Typography>
      </Link>
    </>
  )
}

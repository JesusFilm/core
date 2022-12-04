import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { ReactElement } from 'react'

import { GetVideos_videos } from '../../../../../__generated__/GetVideos'

export interface GridItemProps {
  video?: GetVideos_videos
  routePrefix?: string
}

export function GridItem({ video, routePrefix }: GridItemProps): ReactElement {
  return (
    <>
      <Card
        sx={{
          boxShadow: 0,
          bgcolor: 'rgba(0,0,0,0)',
          borderRadius: '8px'
        }}
      >
        {video == null && (
          <>
            <CardMedia
              component="img"
              image="/loading-blurhash.png"
              height="160"
            />
            <CardContent color="white">
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
            passHref
          >
            <CardActionArea>
              <Box
                sx={{
                  position: 'relative'
                }}
              >
                <CardMedia
                  sx={{ borderRadius: '8px' }}
                  component="img"
                  image={video.image ?? ''}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    color: 'primary.contrastText',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <PlayArrow sx={{ fontSize: '1rem' }} />
                    <Typography variant="body1" sx={{ lineHeight: '1rem' }}>
                      {secondsToTimeFormat(
                        video.variant?.duration ?? 0
                      ).substring(3, 8)}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              <CardContent sx={{ px: 0, pt: '8px', pb: '20px' }}>
                <Link href={`/${video?.slug[0]?.value ?? ''}`} passHref>
                  <Typography
                    variant="h6"
                    sx={{
                      cursor: 'pointer',
                      color: 'rgba(29, 28, 28, 0.9)'
                    }}
                  >
                    {video?.title[0]?.value}
                  </Typography>
                </Link>
              </CardContent>
            </CardActionArea>
          </Link>
        )}
      </Card>
    </>
  )
}

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

import { VideoType } from '../../../../__generated__/globalTypes'
import { GetHomeVideos_videos } from '../../../../__generated__/GetHomeVideos'

export enum designationTypes {
  animation = 'Animation',
  collection = 'Collection',
  feature = 'Feature Film',
  series = 'Series'
}

const designationColors = {
  [designationTypes.animation]: '#7283BE',
  [designationTypes.collection]: '#FF9E00',
  [designationTypes.feature]: '#FF9E00',
  [designationTypes.series]: '#3AA74A'
}

interface VideoListCardProps {
  video?: GetHomeVideos_videos
  designation?: designationTypes
  disabled?: boolean
  routePrefix?: string | undefined
}

export function HomeVideoCard({
  video,
  disabled = false,
  designation,
  routePrefix = undefined
}: VideoListCardProps): ReactElement {
  return (
    <>
      <Card
        sx={{
          width: 338,
          height: 160,
          my: 0,
          mr: 0,
          mb: 0,
          mt: 0
        }}
      >
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
            passHref
          >
            <CardActionArea>
              <Box sx={{ position: 'relative', alignContent: 'end' }}>
                <CardMedia
                  component="img"
                  image={video.image ?? ''}
                  height="160"
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.18)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 14,
                    bottom: 42,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 0,
                    textShadow:
                      '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 2px 3px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  <Typography variant="h6">{video.title[0].value}</Typography>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 14,
                    bottom: 12,
                    right: 14,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 0,
                      gap: '2px',
                      height: '29px',
                      color: (theme) => theme.palette.primary.contrastText
                    }}
                  >
                    <Typography
                      variant="overline2"
                      color={designationColors[designation?.toString() ?? '']}
                    >
                      {designation}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: '4px 8px',
                      gap: '2px',
                      borderRadius: '8px',
                      height: '29px',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: (theme) => theme.palette.primary.contrastText
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
              </Box>
            </CardActionArea>
          </Link>
        )}
      </Card>
    </>
  )
}

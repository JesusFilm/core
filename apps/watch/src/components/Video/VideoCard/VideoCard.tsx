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

import { compact } from 'lodash'
import { VideoContentFields_children } from '../../../../__generated__/VideoContentFields'

interface VideoCardProps {
  video?: VideoContentFields_children
  disabled?: boolean
  routePrefix?: string
  routeSuffix?: string
}

export function VideoCard({
  video,
  disabled = false,
  routePrefix,
  routeSuffix
}: VideoCardProps): ReactElement {
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
            href={`/${compact([routePrefix, video.slug, routeSuffix]).join(
              '/'
            )}`}
            passHref
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
                    color: 'primary.contrastText',
                    borderRadius: '8px',
                    padding: '5px'
                  }}
                >
                  {video.children.length === 0 && (
                    <Stack direction="row">
                      <PlayArrow sx={{ fontSize: '1rem' }} />
                      <Typography variant="body1" sx={{ lineHeight: '16px' }}>
                        {secondsToTimeFormat(video.variant?.duration ?? 0)}
                      </Typography>
                    </Stack>
                  )}
                  {video.children.length > 0 && (
                    <Typography variant="body1">
                      {video.children.length} episodes
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardActionArea>
          </Link>
        )}
      </Card>
      <Link href={`/${video?.slug ?? ''}`} passHref>
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

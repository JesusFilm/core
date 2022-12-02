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

import { GetHomeVideo_video } from '../../../../../__generated__/GetHomeVideo'

export interface GridItemProps {
  video?: GetHomeVideo_video
  data?: GetHomeVideo_video[] | undefined
  disabled?: boolean
  loading?: boolean
  routePrefix?: string
}

export function GridItem({
  video,
  data,
  disabled = false,
  loading = false,
  routePrefix = undefined
}: GridItemProps): ReactElement {
  return (
    <>
      <Card
        sx={{
          boxShadow: 0,
          minWidth: 338,
          maxWidth: 338,
          minHeight: 160,
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
                  position: 'relative',
                  alignContent: 'end'
                }}
              >
                <CardMedia
                  sx={{ borderRadius: '8px' }}
                  component="img"
                  image={video.image ?? ''}
                  height="160"
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
                    <Typography variant="body1" sx={{ lineHeight: '21px' }}>
                      {secondsToTimeFormat(video.variant?.duration ?? 0)}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              <CardContent sx={{ px: 0, pt: '8px', pb: '20px' }}>
                <Link href={`/${video?.slug[0]?.value ?? ''}`} passHref>
                  <Typography
                    variant="h6"
                    sx={{
                      maxWidth: 338,
                      whiteSpace: 'nowrap',
                      overflow: 'none',
                      textOverflow: 'ellipsis',
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

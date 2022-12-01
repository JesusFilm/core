import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { ReactElement } from 'react'
import PlayArrow from '@mui/icons-material/PlayArrow'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import Stack from '@mui/material/Stack'

import { GetHomeVideo_video } from '../../../../../__generated__/GetHomeVideo'
import { VideoType } from '../../../../../__generated__/globalTypes'

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
    <Button>
      <Card
        sx={{
          minWidth: 338,
          height: 140,
          my: 5,
          mr: 20,
          mb: '14px',
          mt: 0
          // zIndex: 0
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
                  {video.type !== VideoType.playlist && (
                    <Stack direction="row">
                      <PlayArrow sx={{ fontSize: '1rem' }} />
                      <Typography variant="body1" sx={{ lineHeight: '16px' }}>
                        {secondsToTimeFormat(video.variant?.duration ?? 0)}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            </CardActionArea>
          </Link>
        )}
      </Card>
      <Link href={`/${video?.slug[0]?.value ?? ''}`} passHref>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 338,
            whiteSpace: 'nowrap',
            overflow: 'none',
            textOverflow: 'ellipsis',
            cursor: 'pointer'
            // zIndex: 1
          }}
          mb={3}
        >
          {video?.title[0]?.value}
        </Typography>
      </Link>
    </Button>
  )
}

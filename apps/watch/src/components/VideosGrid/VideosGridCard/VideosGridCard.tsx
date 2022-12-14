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
import { compact } from 'lodash'
import Image from 'next/image'
import { VideoChildFields } from '../../../../__generated__/VideoChildFields'

export interface VideosGridCardProps {
  video?: VideoChildFields
  routePrefix?: string
}

export function VideosGridCard({
  video,
  routePrefix
}: VideosGridCardProps): ReactElement {
  return (
    <Card
      sx={{
        boxShadow: 0,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {video == null ? (
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
      ) : (
        <Link
          href={`/${compact([routePrefix, video.variant?.slug]).join('/')}`}
          passHref
        >
          <CardActionArea
            aria-label="collection-page-video-card"
            sx={{
              height: '100%',
              width: '100%'
            }}
          >
            <Box
              sx={{
                overflow: 'hidden',
                position: 'relative',
                alignContent: 'end',
                borderRadius: '8px'
              }}
            >
              <CardMedia
                sx={{
                  height: { xs: '168px', sm: '146', md: '160px' },
                  width: 'auto',
                  transition: 'transform .10s ease',
                  transform: 'scale(100%)',
                  '&:hover': {
                    transform: 'scale(103%)'
                  }
                }}
              >
                <Image
                  src={video.image ?? ''}
                  alt={video.imageAlt[0].value}
                  layout="fill"
                  objectFit="cover"
                />
              </CardMedia>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'primary.contrastText',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              >
                {video.children.length === 0 ? (
                  <>
                    <PlayArrow sx={{ fontSize: '1rem' }} />
                    <Typography variant="body1">
                      {secondsToTimeFormat(video.variant?.duration ?? 0, true)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body1">
                    {`${video.children.length} episodes`}
                  </Typography>
                )}
              </Stack>
            </Box>
            <CardContent sx={{ px: 0, pt: 3, pb: 5 }}>
              <Typography variant="h6">{video?.title[0].value}</Typography>
            </CardContent>
          </CardActionArea>
        </Link>
      )}
    </Card>
  )
}

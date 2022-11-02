import { ReactElement } from 'react'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import Image from 'next/image'
import { GetVideos_videos as Video } from '../../../../__generated__/GetVideos'

interface VideoThumbnailProps {
  video: Video
  episode?: number
  isPlaying?: boolean
}

export function VideoThumbnail({
  video,
  episode,
  isPlaying = false
}: VideoThumbnailProps): ReactElement {
  return (
    <Stack spacing={2}>
      <NextLink href={`/${video.slug[0]?.value}` ?? ''} passHref>
        <Box
          sx={{
            position: 'relative',
            width: 352,
            height: 168,
            borderRadius: 2
          }}
        >
          <Image
            src={video.image ?? ''}
            alt="Watch Video"
            layout="fill"
            style={{ borderRadius: 8 }}
          />
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              position: 'absolute',
              bottom: 5,
              right: 5,
              bgcolor: isPlaying ? 'primary.main' : 'rgba(0, 0, 0, 0.5)',
              color: 'primary.contrastText',
              borderRadius: 2,
              padding: 1
            }}
          >
            <PlayArrowRounded />
            {isPlaying ? (
              <Typography variant="body1">Playing Now</Typography>
            ) : (
              <Typography variant="body1">
                {secondsToTimeFormat(video.variant?.duration ?? 0)}
              </Typography>
            )}
          </Stack>
        </Box>
      </NextLink>
      <Typography variant="overline2">Episode {episode}</Typography>
      <Typography variant="h6">{video.title[0]?.value}</Typography>
    </Stack>
  )
}

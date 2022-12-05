import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import { ReactElement } from 'react'
import Skeleton from '@mui/material/Skeleton'
import PlayArrow from '@mui/icons-material/PlayArrow'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import { GetVideos_videos as Video } from '../../../../__generated__/GetVideos'
import 'swiper/swiper.min.css'

interface CarouselItemProps extends Pick<Video, 'title' | 'variant' | 'image'> {
  videoType: string
  index?: number
  isPlaying?: boolean
  onClick: () => void
}

export function CarouselItem({
  title,
  image,
  variant,
  videoType,
  index,
  isPlaying = false,
  onClick
}: CarouselItemProps): ReactElement {
  const videoTitle = title[0].value
  return (
    <Stack
      onClick={onClick}
      sx={{
        width: 338
      }}
    >
      {image != null ? (
        <>
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Image
              src={image}
              alt={videoTitle ?? ''}
              width={338}
              height={160}
              layout="fixed"
              style={{ borderRadius: '8px' }}
            />
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <Image
              src={image}
              alt={videoTitle ?? ''}
              width={232}
              height={110}
              layout="fixed"
              style={{ borderRadius: '8px' }}
            />
          </Box>
        </>
      ) : (
        <Skeleton sx={{ width: '338px' }} />
      )}
      {isPlaying ? (
        <Stack
          alignItems="flex-end"
          justifyContent="flex-end"
          sx={{
            position: 'absolute',
            height: { xs: 110, md: 160 },
            width: { xs: 232, md: 338 }
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              padding: '5px 9px',
              gap: '2px',
              backgroundColor: 'primary.main',
              borderRadius: '8px',
              m: 1
            }}
          >
            <PlayArrow sx={{ color: 'primary.contrastText' }} />
            <Typography variant="body1">Playing Now</Typography>
          </Stack>
        </Stack>
      ) : (
        <Box
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
          display="flex"
          sx={{
            position: 'absolute',
            right: '10%',
            bottom: '5%',
            height: '15%',
            width: '20%',
            background: '#00000080',
            borderRadius: '8px'
          }}
        >
          <PlayArrow sx={{ color: 'primary.contrastText' }} />
          <Typography>{secondsToTimeFormat(variant?.duration ?? 0)}</Typography>
        </Box>
      )}
      {videoType !== 'standalone' && index != null ? (
        <Typography variant="overline2" mb={3}>
          {videoType === 'segment' ? `Chapter ${index}` : `Episode ${index}`}
        </Typography>
      ) : (
        <Skeleton sx={{ width: '90px' }} />
      )}
      <Typography variant="subtitle2" mb={3}>
        {videoTitle}
      </Typography>
    </Stack>
  )
}

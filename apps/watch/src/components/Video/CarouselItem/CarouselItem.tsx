import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement } from 'react'
import Skeleton from '@mui/material/Skeleton'
import { GetVideos_videos as Video } from '../../../../__generated__/GetVideos'

interface CarouselItemProps
  extends Pick<Video, 'title' | 'variant' | 'image' | 'label'> {
  // videoType: eg featureFilm etc
  isPlaying?: boolean
  loading?: boolean
}

export function CarouselItem({
  title,
  image,
  variant,
  isPlaying = false,
  loading = false
}: CarouselItemProps): ReactElement {
  const videoTitle = title[0].value
  // Add in responsive thumbnail image
  // Fix loading
  // Add duration and childCount (eg # episodes)
  // Add isPlaying feature
  // Add onClick

  return (
    <Box sx={{ width: '100%' }}>
      {image != null ? (
        <Image
          src={image}
          alt={videoTitle ?? ''}
          width="100%"
          height="47.5%"
          layout="responsive"
          objectFit="contain"
        />
      ) : (
        <Skeleton sx={{ width: '100%', height: '47.5%' }} />
      )}
      <Typography variant="body1" mb={3} flexWrap="wrap">
        {videoTitle}
      </Typography>
    </Box>
  )
}

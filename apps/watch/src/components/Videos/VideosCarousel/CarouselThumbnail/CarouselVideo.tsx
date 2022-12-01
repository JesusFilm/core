import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement } from 'react'
import Skeleton from '@mui/material/Skeleton'
import PlayArrow from '@mui/icons-material/PlayArrow'
import { GetVideos_videos as Video } from '../../../../../__generated__/GetVideos'
import 'swiper/swiper.min.css'

interface CarouselVideoProps
  extends Pick<Video, 'title' | 'variant' | 'image'> {
  // videoType: eg featureFilm etc
  isPlaying?: boolean
  loading?: boolean
  onClick: () => void
}

export function CarouselVideo({
  title,
  image,
  variant,
  isPlaying = false,
  loading = false,
  onClick
}: CarouselVideoProps): ReactElement {
  const videoTitle = title[0].value
  // Add in responsive thumbnail image - done
  // Fix loading 
  // Add duration and childCount (eg # episodes)
  // Add isPlaying feature - done
  // Add onClick - done
  console.log(variant)
  return (
    <Box>
      <Box
        alignItems="center"
        justifyContent="center"
        flexDirection="row"
        display="flex"
        onClick={onClick}
      >
        {image != null ? (
          <Image
            src={image}
            alt={videoTitle ?? ''}
            width={338}
            height={160}
            layout="fill"            
          />
        ) : (
          <Skeleton />
        )}
        {isPlaying ? 
          <Box 
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            display="flex"
            sx={{position: "absolute", right:"10%", bottom:"5%", height:"15%", width:"20%", background:"#EF3340", borderRadius:"8px"}}
          >
            <PlayArrow sx={{color:"white"}}/><Typography color="white">Playing Now {variant?.duration}</Typography>
          </Box> :
          <Box 
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            display="flex"
            sx={{position: "absolute", right:"10%", bottom:"5%", height:"15%", width:"20%", background:"#00000080", borderRadius:"8px"}}
          >
            <PlayArrow sx={{color:"white"}}/><Typography color="white">{variant?.duration}</Typography>
          </Box>
        }        
      </Box>
      <Typography variant="body1" mb={3}>
        {videoTitle}
      </Typography>
    </Box>
  )
}
import { ReactElement } from 'react'
import { secondsToMinutes } from '@core/shared/ui/timeFormat'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AccessTime from '@mui/icons-material/AccessTime'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Image from 'next/image'
import { GetVideo_video as Video } from '../../../../../__generated__/GetVideo'

import HeroTexture from '../../../../../public/images/hero-texture.svg'

interface VideoHeroOverlayProps {
  video: Video
  isMuted?: boolean
  handleMute?: () => void
  handlePlay?: () => void
}

export function VideoHeroOverlay({
  video,
  isMuted,
  handleMute,
  handlePlay
}: VideoHeroOverlayProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1
      }}
    >
      {video.image != null && (
        <Image
          src={video.image}
          alt={video.title[0].value}
          layout="fill"
          objectFit="cover"
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          zIndex: 2,
          background:
            'linear-gradient(180deg, rgba(50, 50, 51, 0) 34%, rgba(38, 38, 38, 0.3) 46%, rgba(27, 27, 28, 0.46) 66%, #000000 100%), linear-gradient(90deg, #141414 0%, rgba(10, 10, 10, 0.5) 21%, rgba(4, 4, 4, 0.2) 36%, rgba(0, 0, 0, 0) 60%)'
        }}
      />
      <Image
        src={HeroTexture}
        alt="watch hero texture"
        layout="fill"
        objectFit="cover"
        style={{
          zIndex: 3
        }}
      />
      <Container maxWidth="xl" sx={{ zIndex: 4 }}>
        <Stack spacing={{ xs: 2, lg: 5 }}>
          <IconButton
            onClick={handleMute}
            sx={{
              width: 68,
              height: 68,
              borderRadius: 10,
              backgroundColor: 'background.default',
              opacity: 0.7,
              alignSelf: 'end',
              mb: { xs: 20, lg: 20 },
              '&:hover': {
                backgroundColor: 'background.default'
              }
            }}
          >
            {isMuted === true ? <VolumeOffOutlined /> : <VolumeUpOutlined />}
          </IconButton>
          <Typography variant="h2" color="text.primary">
            {video.title[0]?.value}
          </Typography>
          <Stack
            spacing={4}
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{ color: 'text.primary', width: '100%' }}
          >
            <Button size="medium" variant="contained" onClick={handlePlay}>
              <PlayArrowRounded />
              Play Video
            </Button>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                opacity: 0.6
              }}
            >
              <AccessTime sx={{ width: 17, height: 17 }} />
              {video.variant !== null && (
                <Typography variant="body1">
                  {secondsToMinutes(video.variant.duration)} min
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

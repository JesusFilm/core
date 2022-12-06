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
import Image from 'next/image'
import { VideoContentFields } from '../../../../../__generated__/VideoContentFields'
import { HeroOverlay } from '../../../HeroOverlay'

interface VideoHeroOverlayProps {
  video: VideoContentFields
  handlePlay?: () => void
}

export function VideoHeroOverlay({
  video,
  handlePlay
}: VideoHeroOverlayProps): ReactElement {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'end',
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
      <HeroOverlay />
      <Container
        maxWidth="xxl"
        sx={{ zIndex: 4, pb: { xs: 25, md: 20, lg: 43 } }}
      >
        <Stack spacing={{ xs: 2, lg: 5 }}>
          <IconButton
            onClick={handlePlay}
            sx={{
              width: 68,
              height: 68,
              borderRadius: 10,
              backgroundColor: 'background.default',
              opacity: 0.5,
              alignSelf: 'end',
              mb: { xs: 15, lg: 30 },
              '&:hover': {
                backgroundColor: 'background.default'
              }
            }}
          >
            <VolumeOffOutlined />
          </IconButton>
          <Typography variant="h1" color="text.primary" sx={{ width: '70%' }}>
            {video.title[0]?.value}
          </Typography>
          <Stack
            spacing={8}
            direction={{ xs: 'column-reverse', md: 'row' }}
            sx={{ color: 'text.primary', width: '100%', pt: { xs: 0, md: 15 } }}
          >
            <Button
              size="large"
              variant="contained"
              onClick={handlePlay}
              sx={{ display: { xs: 'none', md: 'flex' }, width: 220 }}
            >
              <PlayArrowRounded />
              Play
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handlePlay}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
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

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
import { useVideo } from '../../../../libs/videoContext'
import { HeroOverlay } from '../../../HeroOverlay'
import { AudioLanguageButton } from '../../AudioLanguageButton'

interface VideoHeroOverlayProps {
  handlePlay?: () => void
}

export function VideoHeroOverlay({
  handlePlay
}: VideoHeroOverlayProps): ReactElement {
  const { image, imageAlt, title, variant } = useVideo()

  return (
    <Box
      sx={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        zIndex: 1
      }}
    >
      {image != null && (
        <Image
          src={image}
          alt={imageAlt[0].value}
          layout="fill"
          objectFit="cover"
        />
      )}
      <HeroOverlay />
      <Container
        maxWidth="xxl"
        sx={{
          zIndex: 4,
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        <IconButton
          onClick={handlePlay}
          sx={{
            position: 'absolute',
            top: 80,
            right: 35,
            width: 68,
            height: 68,
            borderRadius: 10,
            backgroundColor: 'background.default',
            opacity: 0.45,
            alignSelf: 'end',
            '&:hover': {
              backgroundColor: 'background.default'
            },
            zIndex: 2
          }}
        >
          <VolumeOffOutlined />
        </IconButton>
        <Stack
          spacing={{ xs: 2, lg: 5 }}
          sx={{ pb: { xs: 15, lg: 33 }, width: '100%' }}
        >
          <Typography
            variant="h1"
            color="text.primary"
            sx={{ width: { xs: '100%', lg: '70%' } }}
          >
            {title[0]?.value}
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
              pt: { xs: 0, md: 15 }
            }}
          >
            <Stack
              spacing={8}
              direction={{ xs: 'column-reverse', md: 'row' }}
              sx={{
                width: '100%'
              }}
            >
              <Button
                size="large"
                variant="contained"
                onClick={handlePlay}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  width: 220,
                  backgroundColor: 'primary.main'
                }}
              >
                <PlayArrowRounded />
                Play
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handlePlay}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  backgroundColor: 'primary.main'
                }}
              >
                <PlayArrowRounded />
                Play Video
              </Button>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  color: 'text.primary',
                  opacity: 0.6
                }}
              >
                <AccessTime sx={{ width: 17, height: 17 }} />
                {variant !== null && (
                  <Typography variant="body1">
                    {secondsToMinutes(variant.duration)} min
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                width: '100%',
                justifyContent: 'end',
                alignItems: 'center'
              }}
            >
              <AudioLanguageButton componentVariant="button" />
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

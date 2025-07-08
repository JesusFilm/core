import AccessTime from '@mui/icons-material/AccessTime'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { secondsToMinutes } from '@core/shared/ui/timeFormat'

import { useVideo } from '../../../../libs/videoContext'
import { DownloadDialog } from '../../../DownloadDialog'
import { HeroOverlay } from '../../../HeroOverlay'
import { ShareButton } from '../../../ShareButton'
import { ShareDialog } from '../../../ShareDialog'
import { AudioLanguageButton } from '../../AudioLanguageButton'
import { DownloadButton } from '../../DownloadButton'

interface VideoHeroOverlayProps {
  handlePlay?: () => void
}

export function VideoHeroOverlay({
  handlePlay
}: VideoHeroOverlayProps): ReactElement {
  const { images, imageAlt, title, variant } = useVideo()
  const [openShare, setOpenShare] = useState(false)
  const [openDownload, setOpenDownload] = useState(false)
  const { t } = useTranslation('apps-watch')
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        zIndex: 1
      }}
      data-testid="VideoHeroOverlay"
    >
      {images[0]?.mobileCinematicHigh != null && (
        <Image
          src={images[0].mobileCinematicHigh}
          alt={imageAlt[0].value}
          fill
          style={{
            objectFit: 'cover'
          }}
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
              pt: { xs: 0, md: 15 },
              width: '100%'
            }}
          >
            <Stack
              direction={{ xs: 'column-reverse', md: 'row' }}
              sx={{ width: { xs: '100%', md: 'unset' }, gap: 8 }}
            >
              <Box
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  justifyContent: 'space-between'
                }}
              >
                <AudioLanguageButton componentVariant="button" />
                <Stack direction="row" spacing={5}>
                  <ShareButton
                    variant="icon"
                    onClick={() => setOpenShare(true)}
                  />
                  <DownloadButton
                    variant="icon"
                    onClick={() => setOpenDownload(true)}
                  />
                </Stack>
              </Box>
              <Button
                id="play-button-lg"
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
                {t('Play')}
              </Button>
              <Button
                id="play-button-sm"
                size="small"
                variant="contained"
                onClick={handlePlay}
                fullWidth
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  backgroundColor: 'primary.main'
                }}
              >
                <PlayArrowRounded />
                {t('Play Video')}
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
                  <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                    {t('{{ duration }} min', {
                      duration: secondsToMinutes(variant.duration)
                    })}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                overflow: 'hidden',
                ml: 10
              }}
            >
              <AudioLanguageButton componentVariant="button" />
            </Box>
          </Stack>
        </Stack>
        {variant != null &&
          variant.downloadable &&
          variant.downloads.length > 0 && (
            <DownloadDialog
              open={openDownload}
              onClose={() => {
                setOpenDownload(false)
              }}
            />
          )}
        <ShareDialog open={openShare} onClose={() => setOpenShare(false)} />
      </Container>
    </Box>
  )
}

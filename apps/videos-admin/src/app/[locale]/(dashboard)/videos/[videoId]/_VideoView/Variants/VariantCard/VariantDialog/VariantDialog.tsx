import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslations } from 'next-intl'
import { ReactElement, useCallback, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideoVariant } from '../../../../../../../../../libs/useAdminVideo'
import { Downloads } from '../../Downloads'

import 'video.js/dist/video-js.css'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
}

export function VariantDialog({
  variant,
  open,
  handleClose
}: VariantDialogProps): ReactElement | null {
  const t = useTranslations()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const playerRef = useRef<Player>()

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node == null) return
    playerRef.current = videojs(node, {
      ...defaultVideoJsOptions,
      fluid: true,
      controls: true,
      liveui: true
    })
  }, [])

  const videoSrc = variant?.downloads.find(
    (download) => download.quality === 'low'
  )?.url

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullscreen={!smUp}
      dialogTitle={{ title: t('Variant'), closeButton: true }}
      slotProps={{ titleButton: { size: 'small' } }}
      divider
    >
      <Stack gap={4}>
        <Typography variant="h2">{variant.language.name[0].value}</Typography>
        <FormControl>
          <Stack direction="row">
            <Stack direction="column">
              <FormLabel>{t('Slug')}</FormLabel>
              <TextField disabled defaultValue={variant.slug} />
            </Stack>
          </Stack>
        </FormControl>
        <Box
          sx={{
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </Box>
        <Downloads downloads={variant.downloads} />
      </Stack>
    </Dialog>
  )
}

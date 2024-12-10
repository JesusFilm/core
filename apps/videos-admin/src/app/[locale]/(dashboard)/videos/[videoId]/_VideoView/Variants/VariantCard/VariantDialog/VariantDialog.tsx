import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { Dialog } from '@core/shared/ui/Dialog'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAdminVideoVariant } from '../../../../../../../../../libs/useAdminVideo'

import 'video.js/dist/video-js.css'
import { Downloads } from './Downloads'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
  variantsMap: Map<string, GetAdminVideoVariant>
}

const UPDATE_VARIANT_LANGUAGE = graphql(`
  mutation VideoVariantUpdate($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      videoId
      slug
      language {
        name {
          value
          primary
        }
      }
    }
  }
`)

export function VariantDialog({
  variant,
  open,
  handleClose,
  variantsMap
}: VariantDialogProps): ReactElement | null {
  const t = useTranslations()
  const defaultLanguage = {
    id: variant.language.id,
    localName: variant.language.name.find(({ primary }) => !primary)?.value,
    nativeName: variant.language.name.find(({ primary }) => primary)?.value
  }
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption>(defaultLanguage)

  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading } = useLanguagesQuery({ languageId: '529' })

  const playerRef = useRef<Player>()

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node == null) return
    playerRef.current = videojs(node, {
      ...defaultVideoJsOptions,
      fluid: true,
      controls: true
    })
  }, [])

  const videoSrc = variant?.downloads.find(
    (download) => download.quality === 'low'
  )?.url

  async function handleChange(value: LanguageOption): Promise<void> {
    const existingVariant = variantsMap.get(value.id)
    if (existingVariant != null) {
      setSelectedLanguage(defaultLanguage)
      enqueueSnackbar(t('variant already exists'), {
        variant: 'error',
        preventDuplicate: false
      })
      return
    }
    console.log('gql call to change variant language')
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullscreen={!smUp}
      dialogTitle={{ title: t('Audio Language'), closeButton: true }}
      divider
      sx={{
        '& .MuiIconButton-root': {
          border: 'none'
        }
      }}
    >
      <Stack gap={4}>
        <LanguageAutocomplete
          onChange={handleChange}
          languages={data?.languages}
          loading={loading}
          value={selectedLanguage}
          renderInput={(params) => (
            <TextField {...params} label={t('Language')} variant="outlined" />
          )}
        />
        <Box
          sx={{
            borderRadius: 2,
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

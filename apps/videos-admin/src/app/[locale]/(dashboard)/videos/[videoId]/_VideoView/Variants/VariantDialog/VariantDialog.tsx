import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

import 'video.js/dist/video-js.css'
import { Downloads } from './Downloads'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
  variantLanguagesMap: Map<string, GetAdminVideoVariant>
}

const UPDATE_VARIANT_LANGUAGE = graphql(`
  mutation VideoVariantUpdate($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      videoId
      slug
      language {
        id
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
  variantLanguagesMap
}: VariantDialogProps): ReactElement | null {
  const t = useTranslations()
  const defaultLanguage = {
    id: variant.language.id,
    localName: variant.language.name.find(({ primary }) => !primary)?.value,
    nativeName: variant.language.name.find(({ primary }) => primary)?.value,
    slug: variant.language.slug
  }
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption>(defaultLanguage)

  const [updateVariantLanguage, { loading: updateVariantLoading }] =
    useMutation(UPDATE_VARIANT_LANGUAGE)

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
    setSelectedLanguage(value)
  }

  async function handleSubmit(): Promise<void> {
    const existingVariant = variantLanguagesMap.get(selectedLanguage.id)
    if (existingVariant != null) {
      enqueueSnackbar(t('variant already exists'), {
        variant: 'error',
        preventDuplicate: false
      })
      return
    }
    await updateVariantLanguage({
      variables: {
        input: {
          id: variant.id,
          languageId: selectedLanguage.id,
          slug: `${variant.slug.split('/')[0]}/${selectedLanguage.slug}`
        }
      }
    })
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
        <Stack
          gap={2}
          direction="row"
          sx={{ width: '100%', alignItems: 'center' }}
        >
          <Box sx={{ width: '90%' }}>
            <LanguageAutocomplete
              onChange={handleChange}
              languages={data?.languages}
              loading={loading || updateVariantLoading}
              value={selectedLanguage}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Language')}
                  variant="outlined"
                />
              )}
            />
          </Box>
          <Box>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                updateVariantLoading ||
                variantLanguagesMap.get(selectedLanguage.id) != null
              }
            >
              {t('Save')}
            </Button>
          </Box>
        </Stack>
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

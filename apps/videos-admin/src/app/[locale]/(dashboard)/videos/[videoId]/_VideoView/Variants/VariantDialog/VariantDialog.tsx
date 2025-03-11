import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { VariantVideo } from '../VariantVideo'

import { Downloads } from './Downloads'
import { VideoEditionChip } from './VideoEditionChip'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
  variantLanguagesMap: Map<string, GetAdminVideoVariant>
}

export const UPDATE_VARIANT_LANGUAGE = graphql(`
  mutation UpdateVariantLanguage($input: VideoVariantUpdateInput!) {
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

export type UpdateVariantLanguageVariables = VariablesOf<
  typeof UPDATE_VARIANT_LANGUAGE
>
export type UpdateVariantLanguage = ResultOf<typeof UPDATE_VARIANT_LANGUAGE>

export function VariantDialog({
  variant,
  open,
  handleClose,
  variantLanguagesMap
}: VariantDialogProps): ReactElement | null {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
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
  const { data, loading } = useLanguagesQuery({ languageId: '529' })

  const videoSrc = variant?.downloads.find(
    (download) => download.quality === 'low'
  )?.url

  async function handleChange(value: LanguageOption): Promise<void> {
    setSelectedLanguage(value)
  }

  async function handleSubmit(): Promise<void> {
    const existingVariant = variantLanguagesMap.get(selectedLanguage.id)
    if (existingVariant != null) return
    await updateVariantLanguage({
      variables: {
        input: {
          id: variant.id,
          languageId: selectedLanguage.id,
          slug: `${variant.slug.split('/')[0]}/${selectedLanguage.slug}`
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Language updated'), {
          preventDuplicate: false,
          variant: 'success'
        })
      }
    })
  }

  const existingVariant = variantLanguagesMap.get(selectedLanguage.id) != null

  return (
    <Dialog
      data-testid="VariantDialog"
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
        {variant.videoEdition?.name != null && (
          <VideoEditionChip editionName={variant.videoEdition.name} />
        )}
        <Stack
          gap={2}
          direction="row"
          sx={{ width: '100%', alignItems: 'center' }}
        >
          <Box sx={{ width: '90%' }}>
            <LanguageAutocomplete
              data-testid="VariantLanguageAutocomplete"
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
            <Tooltip
              data-testid="ExistingVariantTooltip"
              disableHoverListener={!existingVariant}
              title={t('A variant for this language already exists')}
            >
              <Box>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || updateVariantLoading || existingVariant}
                >
                  {t('Save')}
                </Button>
              </Box>
            </Tooltip>
          </Box>
        </Stack>
        <Box
          sx={{
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VariantVideo videoSrc={videoSrc} />
        </Box>
        <Downloads downloads={variant.downloads} videoVariantId={variant.id} />
      </Stack>
    </Dialog>
  )
}

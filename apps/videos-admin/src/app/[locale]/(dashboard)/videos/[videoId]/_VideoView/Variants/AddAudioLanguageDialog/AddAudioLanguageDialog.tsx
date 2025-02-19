import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
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
import { GetAdminVideo_AdminVideo_VideoEditions as VideoEditions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'

export const CREATE_VIDEO_VARIANT = graphql(`
  mutation CreateVideoVariant($input: VideoVariantCreateInput!) {
    videoVariantCreate(input: $input) {
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

interface AddAudioLanguageDialogProps {
  open?: boolean
  handleClose?: () => void
  variantLanguagesMap: Map<string, GetAdminVideoVariant>
  editions?: VideoEditions
}

export function AddAudioLanguageDialog({
  open,
  handleClose,
  variantLanguagesMap,
  editions
}: AddAudioLanguageDialogProps): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const params = useParams<{ videoId: string }>()
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption | null>(null)
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null)

  const [createVideoVariant, { loading }] = useMutation(CREATE_VIDEO_VARIANT)
  const { data, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  const availableLanguages = data?.languages?.filter(
    (language) => !variantLanguagesMap.has(language.id)
  )

  async function handleChange(value: LanguageOption): Promise<void> {
    setSelectedLanguage(value)
  }

  async function handleSubmit(): Promise<void> {
    if (
      selectedLanguage == null ||
      params?.videoId == null ||
      selectedEdition == null
    )
      return
    await createVideoVariant({
      variables: {
        input: {
          id: `${selectedLanguage.id}_${params.videoId}`,
          videoId: params.videoId,
          edition: selectedEdition,
          languageId: selectedLanguage.id,
          slug: `${params.videoId}/${selectedLanguage.slug}`,
          downloadable: true,
          published: true
        }
      },
      onCompleted: () => {
        enqueueSnackbar(t('Audio Language Added'), { variant: 'success' })
        handleClose?.()
      },
      update: (cache, { data }) => {
        if (data?.videoVariantCreate == null) return
        cache.modify({
          id: cache.identify({
            __typename: 'Video',
            id: data.videoVariantCreate.videoId
          }),
          fields: {
            variants(existingVariants = []) {
              const newVariantRef = cache.writeFragment({
                data: data.videoVariantCreate,
                fragment: graphql(`
                  fragment NewVariant on VideoVariant {
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
                `)
              })
              return [...existingVariants, newVariantRef]
            }
          }
        })
      }
    })
  }

  return (
    <Dialog
      open={open ?? false}
      onClose={handleClose}
      dialogTitle={{ title: t('Add Audio Language'), closeButton: true }}
      divider
    >
      <Stack gap={4}>
        <Stack gap={2}>
          <FormControl fullWidth>
            <InputLabel>{t('Edition')}</InputLabel>
            <Select
              data-testid="EditionSelect"
              id="edition"
              name="edition"
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              label={t('Edition')}
            >
              {editions?.map(
                (edition) =>
                  edition?.name != null && (
                    <MenuItem key={edition.id} value={edition.name}>
                      {edition.name}
                    </MenuItem>
                  )
              )}
            </Select>
          </FormControl>
          <Box sx={{ width: '100%' }}>
            <LanguageAutocomplete
              onChange={handleChange}
              languages={availableLanguages}
              loading={loading || languagesLoading}
              value={selectedLanguage ?? undefined}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Language')}
                  variant="outlined"
                />
              )}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleSubmit}
              disabled={loading || languagesLoading || selectedLanguage == null}
            >
              {t('Add')}
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Dialog>
  )
}

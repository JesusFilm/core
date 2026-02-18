import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'
import { NextImage } from '@core/shared/ui/NextImage'

import {
  MediaScreenLogoImageBlockUpdate,
  MediaScreenLogoImageBlockUpdateVariables
} from '../../../../../../../../__generated__/MediaScreenLogoImageBlockUpdate'
import { useImageUpload } from '../../../../../../../libs/useImageUpload'

export const LOGO_IMAGE_BLOCK_UPDATE = gql`
  mutation MediaScreenLogoImageBlockUpdate(
    $id: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, input: $input) {
      id
      src
      alt
      blurhash
      width
      height
      scale
      focalTop
      focalLeft
    }
  }
`

export function LogoSection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const logoImageBlock = journey?.logoImageBlock

  const [imageBlockUpdate] = useMutation<
    MediaScreenLogoImageBlockUpdate,
    MediaScreenLogoImageBlockUpdateVariables
  >(LOGO_IMAGE_BLOCK_UPDATE)

  async function handleUploadComplete(src: string): Promise<void> {
    if (logoImageBlock == null) return
    try {
      await imageBlockUpdate({
        variables: {
          id: logoImageBlock.id,
          input: { src, scale: 100, focalLeft: 50, focalTop: 50 }
        }
      })
      enqueueSnackbar(t('File uploaded successfully'), { variant: 'success' })
    } catch {
      enqueueSnackbar(t('Upload failed. Please try again'), {
        variant: 'error'
      })
    }
  }

  const { getInputProps, open, loading } = useImageUpload({
    onUploadComplete: handleUploadComplete
  })

  return (
    <Stack data-testid="LogoSection" gap={4} sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        {t('Logo')}
      </Typography>
      <Stack direction="row" alignItems="center" gap={7}>
        <Box sx={{ pl: { xs: 0, sm: 10 }, pr: { xs: 0, sm: 6 } }}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: 100, sm: 132 },
              height: { xs: 100, sm: 132 },
              minWidth: { xs: 100, sm: 132 },
              borderRadius: '50%',
              overflow: 'hidden',
              bgcolor: 'background.default'
            }}
          >
            {logoImageBlock?.src != null ? (
              <NextImage
                src={logoImageBlock.src}
                alt={logoImageBlock.alt ?? ''}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%', height: '100%' }}
              >
                <GridEmptyIcon
                  sx={{ fontSize: 48, color: 'action.disabled' }}
                />
              </Stack>
            )}
            {loading && (
              <CircularProgress
                size={32}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  mt: -2,
                  ml: -2
                }}
                data-testid="LogoSection-upload-progress"
              />
            )}
          </Box>
        </Box>
        <Stack spacing={0.5} alignItems="flex-start">
          <input {...getInputProps()} data-testid="LogoSection-file-input" />
          <Button
            size="small"
            color="secondary"
            variant="outlined"
            disabled={loading}
            onClick={open}
            sx={{
              height: 32,
              width: { xs: 160, sm: 220 },
              borderRadius: 2
            }}
          >
            <Typography
              variant="subtitle2"
              fontSize={14}
              sx={{ color: 'text.secondary' }}
            >
              {t('Upload File')}
            </Typography>
          </Button>
          <Typography variant="caption" color="text.secondary">
            {t('Supports JPG, PNG, and GIF files.')}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

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

// This mutation is kept for potential future use
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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const videoSrc = variant?.downloads.find(
    (download) => download.quality === 'low'
  )?.url

  // Get the language name to display
  const languageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

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
        <Box sx={{ width: '100%' }}>
          <Typography variant="h2" data-testid="VariantLanguageDisplay">
            {languageName}
          </Typography>
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VariantVideo videoSrc={videoSrc} />
        </Box>
        <Downloads downloads={variant.downloads} />
      </Stack>
    </Dialog>
  )
}

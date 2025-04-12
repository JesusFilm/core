import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideoVariant } from '../../../../../../libs/useAdminVideo'
import { VariantVideo } from '../_video'

import { Downloads } from './Downloads'
import { VideoEditionChip } from './VideoEditionChip'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
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
  handleClose
}: VariantDialogProps): ReactElement | null {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const languageName =
    variant.language.name.find(({ primary }) => !primary)?.value ??
    variant.language.name[0].value

  const nativeLanguageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

  return (
    <Dialog
      data-testid="VariantDialog"
      open={open}
      onClose={handleClose}
      fullscreen={!smUp}
      dialogTitle={{ title: 'Audio Language', closeButton: true }}
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
          {nativeLanguageName != null && (
            <Typography variant="caption">{nativeLanguageName}</Typography>
          )}
        </Box>
        <Box
          sx={{
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <VariantVideo hlsSrc={variant.hls} />
        </Box>
        <Downloads
          downloads={variant.downloads}
          videoVariantId={variant.id}
          languageId={variant.language.id}
        />
      </Stack>
    </Dialog>
  )
}

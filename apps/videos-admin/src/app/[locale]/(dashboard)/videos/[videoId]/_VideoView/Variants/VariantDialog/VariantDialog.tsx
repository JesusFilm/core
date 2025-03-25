import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { PublishedChip } from '../../../../../../../../components/PublishedChip'
import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { VariantVideo } from '../VariantVideo'

import { Downloads } from './Downloads'
import { VideoEditionChip } from './VideoEditionChip'

interface VariantDialogProps {
  variant: GetAdminVideoVariant
  handleClose?: () => void
  open?: boolean
}

export const UPDATE_VARIANT = graphql(`
  mutation UpdateVariant($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      videoId
      slug
      published
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

export type UpdateVariantVariables = VariablesOf<typeof UPDATE_VARIANT>
export type UpdateVariant = ResultOf<typeof UPDATE_VARIANT>

export function VariantDialog({
  variant,
  open,
  handleClose
}: VariantDialogProps): ReactElement | null {
  const t = useTranslations()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [updateVariant] = useMutation(UPDATE_VARIANT)

  const languageName =
    variant.language.name.find(({ primary }) => !primary)?.value ??
    variant.language.name[0].value

  const nativeLanguageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

  const handlePublishedClick = async (): Promise<void> => {
    await updateVariant({
      variables: {
        input: {
          id: variant.id,
          published: !variant.published
        }
      },
      optimisticResponse: {
        videoVariantUpdate: {
          ...variant,
          published: !variant.published
        }
      }
    })
  }

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
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h2" data-testid="VariantLanguageDisplay">
              {languageName}
            </Typography>
            {nativeLanguageName != null && (
              <Typography variant="caption">{nativeLanguageName}</Typography>
            )}
          </Box>
          <Box onClick={handlePublishedClick} sx={{ cursor: 'pointer' }}>
            <PublishedChip published={variant.published} />
          </Box>
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

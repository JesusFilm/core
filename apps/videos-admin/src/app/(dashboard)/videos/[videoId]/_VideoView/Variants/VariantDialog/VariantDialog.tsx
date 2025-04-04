import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { videoStatuses } from '../../../../../../../constants'
import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [updateVariant] = useMutation(UPDATE_VARIANT)
  const [publishedStatus, setPublishedStatus] = useState<
    'published' | 'unpublished'
  >(variant.published ? 'published' : 'unpublished')
  const [hasChanges, setHasChanges] = useState(false)

  const languageName =
    variant.language.name.find(({ primary }) => !primary)?.value ??
    variant.language.name[0].value

  const nativeLanguageName = variant.language.name.find(
    ({ primary }) => primary
  )?.value

  const handlePublishedChange = (
    event: SelectChangeEvent<'published' | 'unpublished'>
  ): void => {
    const newValue = event.target.value as 'published' | 'unpublished'
    setPublishedStatus(newValue)
    setHasChanges(
      newValue !== (variant.published ? 'published' : 'unpublished')
    )
  }

  const handleSave = async (): Promise<void> => {
    await updateVariant({
      variables: {
        input: {
          id: variant.id,
          published: publishedStatus === 'published'
        }
      },
      optimisticResponse: {
        videoVariantUpdate: {
          ...variant,
          published: publishedStatus === 'published'
        }
      }
    })
    setHasChanges(false)
  }

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mr: 1 }}
            >
              Status
            </Typography>
            <FormControl variant="filled" size="small" sx={{ minWidth: 120 }}>
              <Select
                value={publishedStatus}
                onChange={handlePublishedChange}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1.2
                  },
                  '& .MuiInputBase-root': {
                    height: 40
                  }
                }}
              >
                {videoStatuses.map(({ label, value }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              color="info"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save
            </Button>
          </Stack>
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

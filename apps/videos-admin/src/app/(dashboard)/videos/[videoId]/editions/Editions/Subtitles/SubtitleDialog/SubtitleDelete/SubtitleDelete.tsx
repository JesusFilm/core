import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import {
  GetAdminVideo_AdminVideo_VideoEdition as Edition,
  GetAdminVideo_AdminVideo_VideoEdition_VideoSubtitle as Subtitle
} from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'

export const DELETE_VIDEO_SUBTITLE = graphql(`
  mutation DeleteVideoSubtitle($id: ID!) {
    videoSubtitleDelete(id: $id) {
      id
    }
  }
`)

export type DeleteVideoSubtitleVariables = VariablesOf<
  typeof DELETE_VIDEO_SUBTITLE
>
export type DeleteVideoSubtitle = ResultOf<typeof DELETE_VIDEO_SUBTITLE>

interface SubtitleDeleteProps {
  close: () => void
  edition: Edition
  subtitle: Subtitle
}

export function SubtitleDelete({
  close,
  subtitle,
  edition
}: SubtitleDeleteProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const [deleteSubtitle] = useMutation<
    DeleteVideoSubtitle,
    DeleteVideoSubtitleVariables
  >(DELETE_VIDEO_SUBTITLE, {
    update(cache, { data }) {
      if (data?.videoSubtitleDelete == null) return

      cache.modify({
        id: cache.identify(edition),
        fields: {
          videoSubtitles(existingRefs = [], { readField }) {
            return existingRefs.filter(
              (ref) => readField('id', ref) !== data.videoSubtitleDelete.id
            )
          }
        }
      })
    }
  })

  const handleDelete = async () => {
    await deleteSubtitle({
      variables: { id: subtitle.id },
      onCompleted: () => {
        enqueueSnackbar('Subtitle deleted successfully.', {
          variant: 'success'
        })
        close()
      },
      onError: () => {
        enqueueSnackbar('Something went wrong.', { variant: 'error' })
      }
    })
  }

  return (
    <Stack gap={4}>
      <div>
        <Typography variant="h6">
          Are you sure you want to delete this subtitle?
        </Typography>
        <Typography variant="body2">This action cannot be undone.</Typography>
      </div>
      <DialogActions sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={close}>
          Cancel
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
      </DialogActions>
    </Stack>
  )
}

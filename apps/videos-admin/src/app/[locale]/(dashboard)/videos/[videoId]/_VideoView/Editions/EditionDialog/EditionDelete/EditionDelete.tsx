import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useVideo } from '../../../../../../../../../libs/VideoProvider'

export const DELETE_VIDEO_EDITION = graphql(`
  mutation DeleteVideoEdition($id: ID!) {
    videoEditionDelete(id: $id) {
      id
    }
  }
`)

export type DeleteVideoEditionVariables = VariablesOf<
  typeof DELETE_VIDEO_EDITION
>
export type DeleteVideoEdition = ResultOf<typeof DELETE_VIDEO_EDITION>

interface EditionDeleteProps {
  close: () => void
  edition: any
}

export function EditionDelete({
  close,
  edition
}: EditionDeleteProps): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()

  const [deleteEdition] = useMutation(DELETE_VIDEO_EDITION, {
    update(cache, { data }) {
      if (data?.videoEditionDelete == null) return

      cache.modify({
        id: cache.identify(video),
        fields: {
          videoEditions(existingRefs = [], { readField }) {
            return existingRefs.filter(
              (ref: any) => readField('id', ref) !== data.videoEditionDelete.id
            )
          }
        }
      })
    }
  })

  const handleDelete = async () => {
    await deleteEdition({
      variables: {
        id: edition.id
      },
      onCompleted: () => {
        enqueueSnackbar(t('Edition deleted successfully.'), {
          variant: 'success'
        })
        close()
      },
      onError: () => {
        enqueueSnackbar(t('Something went wrong.'), { variant: 'error' })
      }
    })
  }

  return (
    <Stack gap={4}>
      <div>
        <Typography variant="h6">
          {t('Are you sure you want to delete this edition?')}
        </Typography>
        <Typography variant="body2">
          {t('This action cannot be undone.')}
        </Typography>
      </div>
      <DialogActions sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={close}>
          {t('Cancel')}
        </Button>
        <Button variant="contained" color="error" onClick={handleDelete}>
          {t('Delete')}
        </Button>
      </DialogActions>
    </Stack>
  )
}

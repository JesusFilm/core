import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DialogActions from '@mui/material/DialogActions'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef } from 'react'

import { GetAdminVideo_AdminVideo_VideoEdition as Edition } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../../../libs/VideoProvider'

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
  edition: Edition
}

export function EditionDelete({
  close,
  edition
}: EditionDeleteProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()
  const abortController = useRef<AbortController | null>(null)

  const [deleteEdition, { loading }] = useMutation(DELETE_VIDEO_EDITION, {
    update(cache, { data }) {
      if (data?.videoEditionDelete == null) return

      cache.modify({
        id: cache.identify(video),
        fields: {
          videoEditions(existingRefs = [], { readField }) {
            return existingRefs.filter(
              (ref) => readField('id', ref) !== data.videoEditionDelete.id
            )
          }
        }
      })
    }
  })

  const handleDelete = async () => {
    abortController.current = new AbortController()

    await deleteEdition({
      variables: {
        id: edition.id
      },
      onCompleted: () => {
        enqueueSnackbar('Edition deleted successfully.', {
          variant: 'success'
        })
        close()
      },
      onError: (e) => {
        if (e.message.includes('aborted')) {
          enqueueSnackbar('Edition delete cancelled.')
        } else {
          enqueueSnackbar('Something went wrong.', { variant: 'error' })
        }
      },
      context: {
        fetchOptions: {
          signal: abortController.current?.signal
        }
      }
    })
  }

  const handleCancel = () => {
    if (abortController.current != null && loading) {
      abortController.current.abort()
      abortController.current = null
    }
    close()
  }

  useEffect(() => {
    return () => {
      if (abortController.current != null) {
        abortController.current.abort()
      }
    }
  }, [])

  return (
    <Stack gap={4}>
      <div>
        <Typography variant="h6">
          Are you sure you want to delete this edition?
        </Typography>
        <Typography variant="body2">This action cannot be undone.</Typography>
      </div>
      <DialogActions sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Stack>
  )
}

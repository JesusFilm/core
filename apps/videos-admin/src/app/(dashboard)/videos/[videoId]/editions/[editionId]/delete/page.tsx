'use client'

import { useMutation } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

import { Dialog } from '@core/shared/ui/Dialog'

const DELETE_VIDEO_EDITION = graphql(`
  mutation DeleteVideoEdition($id: ID!) {
    videoEditionDelete(id: $id) {
      id
    }
  }
`)

interface DeleteEditionPageProps {
  params: {
    videoId: string
    editionId: string
  }
}

export default function DeleteEditionPage({
  params: { videoId, editionId }
}: DeleteEditionPageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteEdition, { loading }] = useMutation(DELETE_VIDEO_EDITION)

  const returnUrl = `/videos/${videoId}/editions`
  const handleRemoveEdition = async () => {
    await deleteEdition({
      variables: { id: editionId },
      onCompleted: () => {
        enqueueSnackbar('Edition deleted successfully.', {
          variant: 'success'
        })
        router.push(returnUrl, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar('Failed to delete edition.', {
          variant: 'error'
        })
      }
    })
  }
  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(returnUrl, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Delete Edition',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleRemoveEdition,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={loading}
    >
      Are you sure you want to delete the edition? This action cannot be undone.
    </Dialog>
  )
}

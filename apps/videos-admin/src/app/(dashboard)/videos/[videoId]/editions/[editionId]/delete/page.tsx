'use client'

import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { use } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

const DELETE_VIDEO_EDITION = graphql(`
  mutation DeleteVideoEdition($id: ID!) {
    videoEditionDelete(id: $id) {
      id
    }
  }
`)

interface DeleteEditionPageProps {
  params: Promise<{
    videoId: string
    editionId: string
  }>
}

export default function DeleteEditionPage({
  params
}: DeleteEditionPageProps) {
  const { videoId, editionId } =
    (params as any)?.then != null ? use(params as any) : (params as any)
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

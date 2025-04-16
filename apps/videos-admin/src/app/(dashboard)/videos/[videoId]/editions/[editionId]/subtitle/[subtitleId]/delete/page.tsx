'use client'

import { useMutation } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

import { Dialog } from '@core/shared/ui/Dialog'

const DELETE_VIDEO_SUBTITLE = graphql(`
  mutation DeleteVideoSubtitle($id: ID!) {
    videoSubtitleDelete(id: $id) {
      id
    }
  }
`)

interface SubtitleDeletePageProps {
  params: {
    videoId: string
    editionId: string
    subtitleId: string
  }
}

export default function SubtitleDeletePage({
  params: { videoId, editionId, subtitleId }
}: SubtitleDeletePageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteSubtitle, { loading }] = useMutation(DELETE_VIDEO_SUBTITLE)

  const handleDelete = async () => {
    await deleteSubtitle({
      variables: { id: subtitleId },
      onCompleted: () => {
        enqueueSnackbar('Subtitle deleted successfully.', {
          variant: 'success'
        })
        router.push(`/videos/${videoId}/editions/${editionId}`, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar('Something went wrong.', { variant: 'error' })
      }
    })
  }

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(`/videos/${videoId}/editions/${editionId}`, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Delete Subtitle',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleDelete,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={loading}
    >
      Are you sure you want to delete the subtitle? This action cannot be
      undone.
    </Dialog>
  )
}

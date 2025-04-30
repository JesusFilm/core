'use client'

import { useMutation } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface CitationDeletePageProps {
  params: {
    videoId: string
    citationId: string
  }
}

const DELETE_BIBLE_CITATION = graphql(`
  mutation DeleteBibleCitation($id: ID!) {
    bibleCitationDelete(id: $id)
  }
`)

export default function CitationDeletePage({
  params: { videoId, citationId }
}: CitationDeletePageProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteBibleCitation, { loading: deleteLoading }] = useMutation(
    DELETE_BIBLE_CITATION,
    {
      onCompleted: () => {
        enqueueSnackbar('Bible citation deleted successfully', {
          variant: 'success'
        })
        router.push(`/videos/${videoId}`, {
          scroll: false
        })
      },
      onError: (error) => {
        enqueueSnackbar(error.message || 'Failed to delete Bible citation', {
          variant: 'error'
        })
      }
    }
  )

  const handleDeleteCitation = async (): Promise<void> => {
    await deleteBibleCitation({
      variables: {
        id: citationId
      }
    })
  }

  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}`, { scroll: false })}
      dialogTitle={{
        title: 'Delete Bible Citation',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleDeleteCitation,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={deleteLoading}
    >
      Are you sure you want to delete this Bible citation? This action cannot be
      undone.
    </Dialog>
  )
}

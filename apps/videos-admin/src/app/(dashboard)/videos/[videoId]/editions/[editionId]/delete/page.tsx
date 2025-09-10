'use client'

import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'next-i18next'

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

  const { t } = useTranslation('apps-videos-admin')

  const returnUrl = `/videos/${videoId}/editions`
  const handleRemoveEdition = async () => {
    await deleteEdition({
      variables: { id: editionId },
      onCompleted: () => {
        enqueueSnackbar(t('Edition deleted successfully.'), {
          variant: 'success'
        })
        router.push(returnUrl, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar(t('Failed to delete edition.'), {
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
        title: t('Delete Edition'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleRemoveEdition,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={loading}
    >
      {t('Are you sure you want to delete the edition? This action cannot be undone.')}
    </Dialog>
  )
}

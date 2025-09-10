'use client'

import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useTranslation } from 'next-i18next'

import { graphql } from '@core/shared/gql'
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

  const { t } = useTranslation('apps-videos-admin')

  const handleDelete = async () => {
    await deleteSubtitle({
      variables: { id: subtitleId },
      onCompleted: () => {
        enqueueSnackbar(t('Subtitle deleted successfully.'), {
          variant: 'success'
        })
        router.push(`/videos/${videoId}/editions/${editionId}`, {
          scroll: false
        })
      },
      onError: () => {
        enqueueSnackbar(t('Something went wrong.'), { variant: 'error' })
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
        title: t('Delete Subtitle'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleDelete,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={loading}
    >
      {t(
        'Are you sure you want to delete the subtitle? This action cannot be undone.'
      )}
    </Dialog>
  )
}

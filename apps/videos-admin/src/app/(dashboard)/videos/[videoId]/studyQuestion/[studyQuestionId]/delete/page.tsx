'use client'

import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

interface StudyQuestionDeletePageProps {
  params: {
    videoId: string
    studyQuestionId: string
  }
}

const DELETE_STUDY_QUESTION = graphql(`
  mutation DeleteStudyQuestion($id: ID!) {
    videoStudyQuestionDelete(id: $id) {
      id
    }
  }
`)

export default function StudyQuestionDeletePage({
  params: { videoId, studyQuestionId }
}: StudyQuestionDeletePageProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteStudyQuestion, { loading: deleteLoading }] = useMutation(
    DELETE_STUDY_QUESTION,
    {
      onCompleted: () => {
        enqueueSnackbar(t('Study question deleted'), { variant: 'success' })
        router.push(`/videos/${videoId}`, {
          scroll: false
        })
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  )

  const handleDeleteQuestion = async (): Promise<void> => {
    await deleteStudyQuestion({
      variables: {
        id: studyQuestionId
      }
    })
  }

  const { t } = useTranslation('apps-videos-admin')

  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}`)}
      dialogTitle={{
        title: t('Delete Study Question'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleDeleteQuestion,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={deleteLoading}
    >
      {t(
        'Are you sure you want to delete this study question? This action cannot be undone.'
      )}
    </Dialog>
  )
}

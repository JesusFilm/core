'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { StudyQuestionForm } from '../_StudyQuestionForm/StudyQuestionForm'

const UPDATE_STUDY_QUESTION = graphql(`
  mutation UpdateStudyQuestion($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
      value
    }
  }
`)

const GET_STUDY_QUESTION = graphql(`
  query GetStudyQuestion($id: ID!) {
    adminVideo(id: $id) {
      id
      studyQuestions {
        id
        value
      }
    }
  }
`)
interface StudyQuestionDialogProps {
  params: {
    videoId: string
    studyQuestionId: string
  }
}

export default function StudyQuestionDialog({
  params: { videoId, studyQuestionId }
}: StudyQuestionDialogProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [updateStudyQuestion, { loading }] = useMutation(UPDATE_STUDY_QUESTION)
  const { data } = useSuspenseQuery(GET_STUDY_QUESTION, {
    variables: { id: videoId }
  })
  const returnUrl = `/videos/${videoId}`
  const studyQuestion = data.adminVideo.studyQuestions.find(
    (question) => question.id === studyQuestionId
  )

  if (!studyQuestion) {
    router.push(returnUrl, {
      scroll: false
    })
    return <></>
  }

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    await updateStudyQuestion({
      variables: {
        input: {
          id: studyQuestionId,
          value: values.value
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Study question updated', { variant: 'success' })
        router.push(returnUrl, {
          scroll: false
        })
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    })
  }

  return (
    <Dialog
      open={true}
      onClose={() => router.push(returnUrl)}
      dialogTitle={{
        title: 'Edit Study Question',
        closeButton: true
      }}
    >
      <StudyQuestionForm
        variant="edit"
        initialValues={{ value: studyQuestion.value }}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Dialog>
  )
}

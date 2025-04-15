'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { StudyQuestionForm } from '../_StudyQuestionForm/StudyQuestionForm'

const GET_STUDY_QUESTIONS = graphql(`
  query GetStudyQuestions($videoId: ID!) {
    adminVideo(id: $videoId) {
      id
      studyQuestions {
        id
        order
      }
    }
  }
`)

const CREATE_STUDY_QUESTION = graphql(`
  mutation CreateStudyQuestion($input: VideoStudyQuestionCreateInput!) {
    videoStudyQuestionCreate(input: $input) {
      id
      value
    }
  }
`)

interface StudyQuestionsAddPageProps {
  params: {
    videoId: string
  }
}

export default function StudyQuestionsAddPage({
  params: { videoId }
}: StudyQuestionsAddPageProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useSuspenseQuery(GET_STUDY_QUESTIONS, {
    variables: { videoId }
  })
  const order =
    Math.max(...data.adminVideo.studyQuestions.map(({ order }) => order)) + 1
  const returnUrl = `/videos/${videoId}`
  const [createStudyQuestion, { loading }] = useMutation(
    CREATE_STUDY_QUESTION,
    {
      onCompleted: () => {
        enqueueSnackbar('Study question created', { variant: 'success' })
        router.push(returnUrl, {
          scroll: false
        })
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  )
  const handleSubmit = async (values: { value: string }): Promise<void> => {
    try {
      await createStudyQuestion({
        variables: {
          input: {
            videoId: videoId,
            value: values.value,
            languageId: '529',
            primary: true,
            order
          }
        }
      })
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
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
        title: 'Add Study Question',
        closeButton: true
      }}
    >
      <StudyQuestionForm
        variant="create"
        initialValues={{ value: '' }}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Dialog>
  )
}

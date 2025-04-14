'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { StudyQuestionForm } from '../_form/StudyQuestionForm'

const GET_STUDY_QUESTIONS = graphql(`
  query GetStudyQuestions($videoId: ID!) {
    adminVideo(id: $videoId) {
      studyQuestions {
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
        router.push(returnUrl)
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
      onClose={() => router.push(returnUrl)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          '& .MuiDialogTitle-root': {
            borderBottom: '1px solid',
            borderColor: 'divider'
          }
        }
      }}
    >
      <DialogTitle>Add Study Question</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <StudyQuestionForm
          variant="create"
          initialValues={{ value: '' }}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}

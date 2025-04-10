import { useMutation } from '@apollo/client'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { StudyQuestionForm } from './StudyQuestionForm'
import { GET_STUDY_QUESTIONS } from './StudyQuestionsList'

export const UPDATE_STUDY_QUESTION = graphql(`
  mutation UpdateStudyQuestion($input: VideoStudyQuestionUpdateInput!) {
    videoStudyQuestionUpdate(input: $input) {
      id
      value
    }
  }
`)

export type UpdateStudyQuestion = ResultOf<typeof UPDATE_STUDY_QUESTION>
export type UpdateStudyQuestionVariables = VariablesOf<
  typeof UPDATE_STUDY_QUESTION
>

interface StudyQuestionDialogProps {
  open: boolean
  onClose: () => void
  studyQuestion: {
    id: string
    value: string
  }
  videoId: string
  onQuestionUpdated?: () => void
}

export function StudyQuestionDialog({
  open,
  onClose,
  studyQuestion,
  videoId
}: StudyQuestionDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const [updateStudyQuestion, { loading }] = useMutation<
    UpdateStudyQuestion,
    UpdateStudyQuestionVariables
  >(UPDATE_STUDY_QUESTION, {
    onCompleted: () => {
      enqueueSnackbar('Study question updated', { variant: 'success' })
      onClose()
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    try {
      await updateStudyQuestion({
        variables: {
          input: {
            id: studyQuestion.id,
            value: values.value
          }
        },
        update: (cache, { data }) => {
          if (!data?.videoStudyQuestionUpdate) return

          // Read the current data from cache
          const existingData = cache.readQuery({
            query: GET_STUDY_QUESTIONS,
            variables: { videoId }
          })

          if (!existingData) return

          // Get the updated question from the mutation response
          const updatedQuestion = data.videoStudyQuestionUpdate

          // Create a new array with the updated question
          const updatedQuestions = existingData.adminVideo.studyQuestions.map(
            (question) =>
              question.id === updatedQuestion.id ? updatedQuestion : question
          )

          // Write the updated questions back to the cache
          cache.writeQuery({
            query: GET_STUDY_QUESTIONS,
            variables: { videoId },
            data: {
              adminVideo: {
                ...existingData.adminVideo,
                studyQuestions: updatedQuestions
              }
            }
          })
        }
      })
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Study Question</DialogTitle>
      <DialogContent>
        <StudyQuestionForm
          variant="edit"
          initialValues={{ value: studyQuestion.value }}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}

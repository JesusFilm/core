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
  videoId,
  onQuestionUpdated
}: StudyQuestionDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const [updateStudyQuestion, { loading }] = useMutation<
    UpdateStudyQuestion,
    UpdateStudyQuestionVariables
  >(UPDATE_STUDY_QUESTION, {
    onCompleted: () => {
      enqueueSnackbar('Study question updated', { variant: 'success' })
      if (onQuestionUpdated) {
        onQuestionUpdated()
      }
      onClose()
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    },
    refetchQueries: [
      {
        query: GET_STUDY_QUESTIONS,
        variables: { videoId }
      }
    ]
  })

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    try {
      await updateStudyQuestion({
        variables: {
          input: {
            id: studyQuestion.id,
            value: values.value
          }
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

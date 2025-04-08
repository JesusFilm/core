import { useMutation } from '@apollo/client'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { GET_ADMIN_VIDEO } from '../../../../../../../libs/useAdminVideo'
import { useVideo } from '../../../../../../../libs/VideoProvider'

import { StudyQuestionForm } from './StudyQuestionForm'

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
  onQuestionUpdated?: () => void
}

export function StudyQuestionDialog({
  open,
  onClose,
  studyQuestion,
  onQuestionUpdated
}: StudyQuestionDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()

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
        refetchQueries: [
          {
            query: GET_ADMIN_VIDEO,
            variables: { videoId: video.id }
          }
        ]
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

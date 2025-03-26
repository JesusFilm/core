import { useMutation } from '@apollo/client'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

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
}

export function StudyQuestionDialog({
  open,
  onClose,
  studyQuestion
}: StudyQuestionDialogProps): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()

  const [updateStudyQuestion, { loading }] = useMutation<
    UpdateStudyQuestion,
    UpdateStudyQuestionVariables
  >(UPDATE_STUDY_QUESTION, {
    onCompleted: () => {
      enqueueSnackbar(t('Study question updated'), { variant: 'success' })
      onClose()
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    },
    update: (cache, { data }) => {
      if (!data?.videoStudyQuestionUpdate) return

      // This updates any queries that include this specific study question
      cache.modify({
        id: cache.identify({
          __typename: 'VideoStudyQuestion',
          id: data.videoStudyQuestionUpdate.id
        }),
        fields: {
          value: () => data.videoStudyQuestionUpdate.value
        }
      })
    }
  })

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    await updateStudyQuestion({
      variables: {
        input: {
          id: studyQuestion.id,
          value: values.value
        }
      }
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Edit Study Question')}</DialogTitle>
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

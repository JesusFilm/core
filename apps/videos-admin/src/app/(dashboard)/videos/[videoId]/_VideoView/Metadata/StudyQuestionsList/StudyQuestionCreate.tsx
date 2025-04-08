import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { GET_ADMIN_VIDEO } from '../../../../../../../libs/useAdminVideo'
import { GetAdminVideo_AdminVideo_StudyQuestions as StudyQuestions } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useVideo } from '../../../../../../../libs/VideoProvider'

import { StudyQuestionForm } from './StudyQuestionForm'

export const CREATE_STUDY_QUESTION = graphql(`
  mutation CreateStudyQuestion($input: VideoStudyQuestionCreateInput!) {
    videoStudyQuestionCreate(input: $input) {
      id
      value
    }
  }
`)

export type CreateStudyQuestion = ResultOf<typeof CREATE_STUDY_QUESTION>
export type CreateStudyQuestionVariables = VariablesOf<
  typeof CREATE_STUDY_QUESTION
>

interface StudyQuestionCreateProps {
  studyQuestions: StudyQuestions
  onQuestionAdded?: () => void
}

export function StudyQuestionCreate({
  studyQuestions,
  onQuestionAdded
}: StudyQuestionCreateProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()
  const [open, setOpen] = useState(false)

  const [createStudyQuestion, { loading }] = useMutation<
    CreateStudyQuestion,
    CreateStudyQuestionVariables
  >(CREATE_STUDY_QUESTION, {
    onCompleted: () => {
      enqueueSnackbar('Study question created', { variant: 'success' })
      // Force refetch the query to get fresh data
      if (onQuestionAdded) {
        onQuestionAdded()
      }
      handleClose()
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    const nextOrder = studyQuestions.length + 1

    try {
      await createStudyQuestion({
        variables: {
          input: {
            videoId: video.id,
            value: values.value,
            languageId: '529',
            primary: true,
            order: nextOrder
          }
        },
        // Add the refetchQueries directly to the mutation call
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

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleOpen}
          size="small"
          color="secondary"
        >
          Add
        </Button>
      </Stack>
      <Dialog
        open={open}
        onClose={handleClose}
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
    </>
  )
}

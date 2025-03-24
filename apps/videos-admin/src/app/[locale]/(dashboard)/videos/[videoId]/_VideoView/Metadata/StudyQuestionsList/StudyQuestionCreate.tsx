import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useVideo } from '../../../../../../../../libs/VideoProvider'

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

export function StudyQuestionCreate(): ReactElement {
  const t = useTranslations()
  const { enqueueSnackbar } = useSnackbar()
  const video = useVideo()
  const [open, setOpen] = useState(false)

  const [createStudyQuestion, { loading }] = useMutation<
    CreateStudyQuestion,
    CreateStudyQuestionVariables
  >(CREATE_STUDY_QUESTION, {
    onCompleted: () => {
      enqueueSnackbar(t('Study question created'), { variant: 'success' })
      handleClose()
    },
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    await createStudyQuestion({
      variables: {
        input: {
          videoId: video.id,
          value: values.value
        }
      }
    })
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('Add Study Question')}
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Add Study Question')}</DialogTitle>
        <DialogContent>
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

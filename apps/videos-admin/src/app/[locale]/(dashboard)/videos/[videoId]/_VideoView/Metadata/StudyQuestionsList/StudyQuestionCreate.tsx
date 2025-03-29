import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { GetAdminVideo_AdminVideo_StudyQuestions as StudyQuestions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
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

interface StudyQuestionCreateProps {
  studyQuestions: StudyQuestions
}

export function StudyQuestionCreate({
  studyQuestions
}: StudyQuestionCreateProps): ReactElement {
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
    },
    update: (cache, { data }) => {
      if (!data?.videoStudyQuestionCreate) return

      try {
        // Find the cached video object
        const videoId = cache.identify({
          __typename: 'AdminVideo',
          id: video.id
        })

        if (videoId) {
          // Modify the studyQuestions field to include the new question
          cache.modify({
            id: videoId,
            fields: {
              studyQuestions: (existingStudyQuestions = []) => {
                // Create a new study question reference
                const newQuestionRef = cache.writeFragment({
                  data: data.videoStudyQuestionCreate,
                  fragment: graphql(`
                    fragment NewStudyQuestion on VideoStudyQuestion {
                      id
                      value
                    }
                  `)
                })
                return [...existingStudyQuestions, newQuestionRef]
              }
            }
          })
        }
      } catch (e) {
        console.error('Error updating cache:', e)
      }
    }
  })

  const handleSubmit = async (values: { value: string }): Promise<void> => {
    const nextOrder = studyQuestions.length + 1
    await createStudyQuestion({
      variables: {
        input: {
          videoId: video.id,
          value: values.value,
          languageId: '529',
          primary: true,
          order: nextOrder
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
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={handleOpen}
          size="small"
          color="secondary"
        >
          {t('Add')}
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
        <DialogTitle>{t('Add Study Question')}</DialogTitle>
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

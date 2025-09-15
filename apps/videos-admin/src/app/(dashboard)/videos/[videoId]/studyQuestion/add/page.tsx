'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useParams, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

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

export default function StudyQuestionsAddPage(): ReactElement {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useSuspenseQuery(GET_STUDY_QUESTIONS, {
    variables: { videoId }
  })
  const validationSchema = object().shape({
    value: string().required('Study question is required')
  })
  const order =
    data.adminVideo.studyQuestions.length === 0
      ? 1
      : Math.max(...data.adminVideo.studyQuestions.map(({ order }) => order)) +
        1
  const returnUrl = `/videos/${videoId}`
  const [createStudyQuestion, { loading }] = useMutation(CREATE_STUDY_QUESTION)
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
        },
        onCompleted: () => {
          enqueueSnackbar('Study question created', { variant: 'success' })
          router.push(returnUrl, {
            scroll: false
          })
        },
        onError: (error) => {
          enqueueSnackbar(error.message, { variant: 'error' })
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
      {/* <StudyQuestionForm
        variant="create"
        initialValues={}
        onSubmit={}
        loading={loading}
      /> */}
      <Formik
        initialValues={{ value: '' }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
          <Form>
            <Stack gap={3}>
              <TextField
                id="value"
                name="value"
                placeholder="Enter study question"
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                value={values.value}
                variant="outlined"
                error={Boolean(errors.value)}
                onChange={handleChange}
                helperText={errors.value}
                autoFocus
                sx={{
                  '& .MuiInputBase-root': {
                    height: 'auto'
                  }
                }}
              />
              <Stack direction="row" gap={2} justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="outlined"
                  color="secondary"
                  disabled={!isValid || !dirty || isSubmitting || loading}
                >
                  Add
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

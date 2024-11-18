import { useTranslations } from 'next-intl'
import { useEdit } from '../../../_EditProvider'
import { useParams } from 'next/navigation'
import { useAdminVideo } from '../../../../../../../../libs/useAdminVideo'
import { useMutation } from '@apollo/client'
import { graphql } from 'gql.tada'
import Stack from '@mui/material/Stack'
import { SaveButton } from '../../../../../../../../components/SaveButton'
import { Form, Formik, FormikValues } from 'formik'
import { object, string } from 'yup'
import { ReactElement } from 'react'
import { ResizableTextField } from '../../../../../../../../components/ResizableTextField'

export const UPDATE_VIDEO_SNIPPET = graphql(`
  mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
    videoSnippetUpdate(input: $input) {
      id
      value
    }
  }
`)

export function VideoSnippet(): ReactElement {
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()
  const [updateVideoSnippet] = useMutation(UPDATE_VIDEO_SNIPPET)
  const params = useParams<{ videoId: string; locale: string }>()
  const { data } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })
  const video = data?.adminVideo

  const validationSchema = object().shape({
    snippet: string().required(t('Snippet is required'))
  })

  async function handleUpdateVideoSnippet(values: FormikValues): Promise<void> {
    if (video == null) return
    await updateVideoSnippet({
      variables: {
        input: {
          id: video.snippet[0].id,
          value: values.snippet
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        snippet: video?.snippet?.[0].value
      }}
      onSubmit={handleUpdateVideoSnippet}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={2}>
            <ResizableTextField
              id="snippet"
              name="snippet"
              value={values.snippet}
              handleChange={(e) => handleChange(e)}
              error={Boolean(errors.snippet)}
              helperText={errors.snippet as string}
              disabled={!isEdit}
              minRows={6}
              maxRows={6}
            />
            {isEdit && (
              <Stack direction="row" justifyContent="flex-end">
                <SaveButton disabled={!isValid || isSubmitting || !dirty} />
              </Stack>
            )}
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

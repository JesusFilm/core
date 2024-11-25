import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { ResizableTextField } from '../../../../../../../../components/ResizableTextField'
import { SaveButton } from '../../../../../../../../components/SaveButton'
import { GetAdminVideo_AdminVideo_VideoSnippets as VideoSnippets } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useEdit } from '../../../_EditProvider'

export const UPDATE_VIDEO_SNIPPET = graphql(`
  mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
    videoSnippetUpdate(input: $input) {
      id
      value
    }
  }
`)

interface VideoSnippetProps {
  videoSnippets: VideoSnippets
}

export function VideoSnippet({
  videoSnippets
}: VideoSnippetProps): ReactElement {
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()
  const [updateVideoSnippet] = useMutation(UPDATE_VIDEO_SNIPPET)

  const validationSchema = object().shape({
    snippet: string().required(t('Snippet is required'))
  })

  async function handleUpdateVideoSnippet(values: FormikValues): Promise<void> {
    if (videoSnippets == null) return
    await updateVideoSnippet({
      variables: {
        input: {
          id: videoSnippets[0].id,
          value: values.snippet
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        snippet: videoSnippets?.[0].value
      }}
      onSubmit={handleUpdateVideoSnippet}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={2}>
            <ResizableTextField
              name="snippet"
              aria-label="snippet"
              value={values.snippet}
              onChange={handleChange}
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
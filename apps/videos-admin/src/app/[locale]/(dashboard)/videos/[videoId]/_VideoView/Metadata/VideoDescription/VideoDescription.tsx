import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import unescape from 'lodash/unescape'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { ResizableTextField } from '../../../../../../../../components/ResizableTextField'
import { SaveButton } from '../../../../../../../../components/SaveButton'
import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'

export const UPDATE_VIDEO_DESCRIPTION = graphql(`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
      value
    }
  }
`)

interface VideoDescriptionProps {
  videoDescriptions: VideoDescriptions
}

export function VideoDescription({
  videoDescriptions
}: VideoDescriptionProps): ReactElement {
  const t = useTranslations()
  const [updateVideoDescription] = useMutation(UPDATE_VIDEO_DESCRIPTION)

  const validationSchema = object().shape({
    description: string().required(t('Description is required'))
  })

  async function handleUpdateVideoDescription(
    values: FormikValues
  ): Promise<void> {
    if (videoDescriptions == null) return
    await updateVideoDescription({
      variables: {
        input: {
          id: videoDescriptions[0].id,
          value: values.description
        }
      }
    })
  }
  const description = unescape(videoDescriptions?.[0].value).replace(
    /&#13;/g,
    '\n'
  )

  return (
    <Formik
      initialValues={{
        description
      }}
      onSubmit={handleUpdateVideoDescription}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={2}>
            <ResizableTextField
              name="description"
              aria-label="description"
              value={values.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description as string}
              minRows={6}
              maxRows={6}
            />

            <Stack direction="row" justifyContent="flex-end">
              <SaveButton disabled={!isValid || isSubmitting || !dirty} />
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

import { useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { ResizableTextField } from '../../../../../../../../components/ResizableTextField'
import { SaveButton } from '../../../../../../../../components/SaveButton'
import { GetAdminVideo_AdminVideo_VideoDescriptions as VideoDescriptions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useEdit } from '../../../_EditProvider'

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
  const {
    state: { isEdit }
  } = useEdit()
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

  return (
    <Formik
      initialValues={{
        description: videoDescriptions?.[0].value
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
              value={values.description}
              onChange={handleChange}
              error={Boolean(errors.description)}
              helperText={errors.description as string}
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

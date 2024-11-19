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

export const UPDATE_VIDEO_DESCRIPTION = graphql(`
  mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
    videoDescriptionUpdate(input: $input) {
      id
      value
    }
  }
`)

export function VideoDescription(): ReactElement {
  const t = useTranslations()
  const {
    state: { isEdit }
  } = useEdit()
  const [updateVideoDescription] = useMutation(UPDATE_VIDEO_DESCRIPTION)
  const params = useParams<{ videoId: string; locale: string }>()
  const { data } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })
  const video = data?.adminVideo

  const validationSchema = object().shape({
    description: string().required(t('Description is required'))
  })

  async function handleUpdateVideoDescription(
    values: FormikValues
  ): Promise<void> {
    if (video == null) return
    await updateVideoDescription({
      variables: {
        input: {
          id: video.description[0].id,
          value: values.description
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        description: video?.description?.[0].value
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

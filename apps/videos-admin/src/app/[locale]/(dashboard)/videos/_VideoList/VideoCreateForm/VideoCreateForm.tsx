import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, useField } from 'formik'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { InferType, mixed, object, string } from 'yup'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { FormSelectField } from '../../../../../../components/FormSelectField'
import { FormTextField } from '../../../../../../components/FormTextField'
import { videoLabels } from '../../../../../../constants'

enum VideoLabel {
  behindTheScenes = 'behindTheScenes',
  collection = 'collection',
  episode = 'episode',
  featureFilm = 'featureFilm',
  segment = 'segment',
  series = 'series',
  shortFilm = 'shortFilm',
  trailer = 'trailer'
}

export const CREATE_VIDEO = graphql(`
  mutation CreateVideo($input: VideoCreateInput!) {
    videoCreate(input: $input) {
      id
    }
  }
`)

export type CreateVideoVariables = VariablesOf<typeof CREATE_VIDEO>
export type CreateVideo = ResultOf<typeof CREATE_VIDEO>

interface VideoCreateFormProps {
  onCancel: () => void
}

function LanguageSelect({ label }: { label: string }): ReactElement {
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const [formikProps, meta, helpers] = useField('primaryLanguageId')
  const [selectedLanguage, setSelectedLanguage] = useState<
    LanguageOption | undefined
  >(undefined)

  const handleChange = async (newLanguage: LanguageOption) => {
    setSelectedLanguage(newLanguage)
    await helpers.setValue(newLanguage.id)
  }

  const hasError = meta.error !== undefined && meta.touched

  return (
    <LanguageAutocomplete
      value={selectedLanguage}
      onChange={handleChange}
      loading={loading}
      languages={data?.languages}
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={formikProps.onBlur}
          label={label}
          variant="outlined"
          helperText={hasError ? meta.error : ''}
          error={hasError}
        />
      )}
    />
  )
}

export function VideoCreateForm({
  onCancel
}: VideoCreateFormProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const t = useTranslations()
  const validationSchema = object().shape({
    id: string().trim().required(t('ID is required')),
    slug: string().trim().required(t('Slug is required')),
    primaryLanguageId: string().required(t('Primary language is required')),
    label: mixed<VideoLabel>()
      .oneOf(Object.values(VideoLabel))
      .required(t('Label is required'))
  })

  const [createVideo] = useMutation(CREATE_VIDEO)

  const handleSubmit = async (values: InferType<typeof validationSchema>) => {
    try {
      const res = await createVideo({
        variables: {
          input: {
            id: values.id,
            slug: values.slug,
            label: values.label,
            primaryLanguageId: values.primaryLanguageId,
            noIndex: false,
            published: false,
            childIds: []
          }
        }
      })

      if (res.data?.videoCreate != null) {
        enqueueSnackbar(t('Successfully created video.'))
      } else {
        enqueueSnackbar(t('Something went wrong.'))
      }
    } catch (e) {
      // TODO: proper error handling for specific errors
      enqueueSnackbar(
        t(`Failed to create video: ID already exists`, {
          variant: 'error',
          preventDuplicate: false
        })
      )
    }
  }

  const initialValues: InferType<typeof validationSchema> = {
    id: '',
    slug: '',
    label: '' as VideoLabel,
    primaryLanguageId: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      <Form data-testid="VideoCreateForm">
        <Stack gap={2}>
          <FormTextField name="id" label={t('ID')} fullWidth />
          <FormTextField name="slug" label={t('Slug')} fullWidth />
          <FormSelectField
            name="label"
            label={t('Label')}
            options={videoLabels}
            fullWidth
          />
          <LanguageSelect label={t('Primary Language')} />
          <Stack direction="row" justifyContent="end" gap={1}>
            <Button variant="text" onClick={onCancel}>
              {t('Cancel')}
            </Button>
            <Button variant="contained" type="submit">
              {t('Create')}
            </Button>
          </Stack>
        </Stack>
      </Form>
    </Formik>
  )
}

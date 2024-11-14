import { useMutation } from '@apollo/client'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'
import { boolean, object, string } from 'yup'

import { SaveButton } from '../../../../../../../../components/SaveButton'
import { useAdminVideo } from '../../../../../../../../libs/useAdminVideo'

const videoStatuses = [
  { label: 'Published', value: 'published' },
  { label: 'Unpublished', value: 'unpublished' }
]

const videoLabels = [
  { label: 'Collection', value: 'collection' },
  { label: 'Episode', value: 'episode' },
  { label: 'Feature Film', value: 'featureFilm' },
  { label: 'Segment', value: 'segment' },
  { label: 'Series', value: 'series' },
  { label: 'Short Film', value: 'shortFilm' },
  { label: 'Trailer', value: 'trailer' },
  { label: 'Behind The Scenes', value: 'behindTheScenes' }
]

interface VideoInformationProps {
  isEdit: boolean
}

const UPDATE_VIDEO_INFORMATION = graphql(`
  mutation UpdateVideoInformation(
    $titleInput: VideoTranslationUpdateInput!
    $infoInput: VideoUpdateInput!
  ) {
    videoTitleUpdate(input: $titleInput) {
      id
      value
    }
    videoUpdate(input: $infoInput) {
      id
      label
      slug
      published
      noIndex
    }
  }
`)

export function VideoInformation({
  isEdit
}: VideoInformationProps): ReactElement {
  const t = useTranslations()
  const [updateVideoInformation] = useMutation(UPDATE_VIDEO_INFORMATION)
  const params = useParams<{ videoId: string; locale: string }>()
  const { data } = useAdminVideo({
    variables: { videoId: params?.videoId as string }
  })
  const video = data?.adminVideo

  const validationSchema = object().shape({
    title: string().trim().required(t('Required')),
    slug: string().trim().required(t('Required')),
    published: string().required(),
    label: string().required(t('Required')),
    noIndex: boolean()
  })

  async function handleUpdateVideoInformation(
    values: FormikValues
  ): Promise<void> {
    if (video == null) return
    await updateVideoInformation({
      variables: {
        infoInput: {
          id: video.id,
          slug: values.slug,
          published: values.published === 'published',
          label: values.label,
          noIndex: values.noIndex
        },
        titleInput: {
          id: video.title[0].id,
          value: values.title
        }
      }
    })
  }

  return (
    <Formik
      initialValues={{
        title: video?.title?.[0].value,
        slug: video?.slug,
        published: video?.published === true ? 'published' : 'unpublished',
        label: video?.label,
        noIndex: video?.noIndex
      }}
      onSubmit={handleUpdateVideoInformation}
      validationSchema={validationSchema}
      enableReinitialize
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={2}>
            <Stack direction="row" gap={2}>
              <TextField
                id="title"
                name="title"
                label={t('Title')}
                fullWidth
                value={values.title}
                variant="outlined"
                error={Boolean(errors.title)}
                onChange={handleChange}
                helperText={errors.title as string}
                disabled={!isEdit}
              />
              <TextField
                id="slug"
                name="Slug"
                label={t('Slug')}
                fullWidth
                value={values.slug}
                variant="outlined"
                error={Boolean(errors.slug)}
                onChange={handleChange}
                helperText={errors.slug as string}
                disabled
              />
            </Stack>
            <Stack direction="row" gap={2}>
              <FormControl variant="standard">
                <InputLabel id="status-select-label">{t('Status')}</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status"
                  name="published"
                  label="Status"
                  value={values.published}
                  onChange={handleChange}
                  disabled={!isEdit}
                >
                  {videoStatuses.map(({ label, value }) => (
                    <MenuItem key={label} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="standard">
                <InputLabel id="label-select-label">{t('Label')}</InputLabel>
                <Select
                  labelId="label-select-label"
                  id="label"
                  name="label"
                  label="Label"
                  value={values?.label}
                  onChange={handleChange}
                  disabled={!isEdit}
                >
                  {videoLabels.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                label="No Index"
                control={
                  <Checkbox
                    name="noIndex"
                    checked={values.noIndex}
                    onChange={handleChange}
                    disabled={!isEdit}
                  />
                }
              />
            </Stack>
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

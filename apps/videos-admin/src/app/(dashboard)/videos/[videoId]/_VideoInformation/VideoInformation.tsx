'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { object, string } from 'yup'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

const videoStatuses = [
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'unpublished' }
]

const videoLabels = [
  { label: 'Collection', value: 'collection' },
  { label: 'Episode', value: 'episode' },
  { label: 'Feature Film', value: 'featureFilm' },
  { label: 'Clip', value: 'segment' },
  { label: 'Series', value: 'series' },
  { label: 'Short Film', value: 'shortFilm' },
  { label: 'Trailer', value: 'trailer' },
  { label: 'Behind The Scenes', value: 'behindTheScenes' }
]

interface VideoInformationProps {
  videoId: string
}

export const GET_VIDEO_INFORMATION = graphql(`
  query GetVideoInformation($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      label
      published
      slug
      title(languageId: $languageId) {
        id
        value
      }
    }
  }
`)

export const UPDATE_VIDEO_INFORMATION = graphql(`
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
    }
  }
`)

export const CREATE_VIDEO_TITLE = graphql(`
  mutation CreateVideoTitle($input: VideoTranslationCreateInput!) {
    videoTitleCreate(input: $input) {
      id
      value
    }
  }
`)

export function VideoInformation({
  videoId
}: VideoInformationProps): ReactElement {
  const router = useRouter()
  const [updateVideoInformation] = useMutation(UPDATE_VIDEO_INFORMATION)
  const [createVideoTitle] = useMutation(CREATE_VIDEO_TITLE)
  const theme = useTheme()
  const jesusFilmUrl = 'jesusfilm.org/watch/'
  const { enqueueSnackbar } = useSnackbar()

  const validationSchema = object().shape({
    title: string().trim().required('Title is required'),
    url: string().trim().required('Url is required'),
    published: string().required('Published is required'),
    label: string().required('Label is required')
  })

  const { data } = useSuspenseQuery(GET_VIDEO_INFORMATION, {
    variables: {
      id: videoId,
      languageId: DEFAULT_VIDEO_LANGUAGE_ID
    }
  })

  async function handleUpdateVideoInformation(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    let titleId = data.adminVideo.title[0]?.id ?? null
    const params = new URLSearchParams('')
    params.append('update', 'information')
    router.push(`?${params.toString()}`, { scroll: false })

    if (titleId == null) {
      const res = await createVideoTitle({
        variables: {
          input: {
            videoId: videoId,
            value: values.title,
            primary: true,
            languageId: DEFAULT_VIDEO_LANGUAGE_ID
          }
        },
        onError: () => {
          enqueueSnackbar('Failed to create video title', {
            variant: 'error'
          })
        }
      })

      if (res?.data?.videoTitleCreate == null) {
        enqueueSnackbar('Failed to create video title', {
          variant: 'error'
        })
        return
      }

      titleId = res.data.videoTitleCreate.id
    }

    await updateVideoInformation({
      variables: {
        infoInput: {
          id: videoId,
          slug: values.url,
          published: values.published === 'published',
          label: values.label
        },
        titleInput: {
          id: titleId,
          value: values.title
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully updated video information', {
          variant: 'success'
        })
        resetForm({ values })
        router.push('?', { scroll: false })
      },
      onError: () => {
        enqueueSnackbar('Failed to update video information', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Formik
      initialValues={{
        title: data.adminVideo.title[0]?.value ?? '',
        url: data.adminVideo.slug,
        published:
          data.adminVideo.published === true ? 'published' : 'unpublished',
        label: data.adminVideo.label ?? ''
      }}
      onSubmit={handleUpdateVideoInformation}
      validationSchema={validationSchema}
    >
      {({
        values,
        errors,
        handleChange,
        isValid,
        isSubmitting,
        dirty,
        resetForm
      }) => (
        <Form>
          <Stack gap={2}>
            <Stack
              gap={2}
              sx={{
                flexDirection: { xs: 'col', sm: 'row' }
              }}
            >
              <TextField
                id="title"
                name="title"
                label="Title"
                fullWidth
                value={values.title}
                variant="outlined"
                error={Boolean(errors.title)}
                onChange={handleChange}
                helperText={errors.title as string}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                id="url"
                name="url"
                label="Video URL"
                fullWidth
                value={values.url}
                variant="outlined"
                error={Boolean(errors.url)}
                onChange={handleChange}
                helperText={errors.url as string}
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        disablePointerEvents
                        sx={{
                          backgroundColor: theme.palette.background.paper,
                          px: 2,
                          py: 3,
                          borderRight: `1px solid ${theme.palette.divider}`,
                          borderTopLeftRadius: theme.shape.borderRadius,
                          borderBottomLeftRadius: theme.shape.borderRadius
                        }}
                      >
                        {jesusFilmUrl}
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    pl: 0
                  }
                }}
              />
            </Stack>
            <Stack
              gap={2}
              sx={{
                flexDirection: { xs: 'col', sm: 'row' },
                alignItems: { xs: 'start', sm: 'end' }
              }}
            >
              <FormControl variant="standard">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status"
                  name="published"
                  label="Status"
                  value={values.published}
                  onChange={handleChange}
                >
                  {videoStatuses.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="standard">
                <InputLabel id="label-select-label">Label</InputLabel>
                <Select
                  labelId="label-select-label"
                  id="label"
                  name="label"
                  label="Label"
                  value={values.label}
                  onChange={handleChange}
                >
                  {videoLabels.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Divider sx={{ mx: -4 }} />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <CancelButton show={dirty} handleCancel={() => resetForm()} />
              <SaveButton disabled={!isValid || isSubmitting || !dirty} />
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

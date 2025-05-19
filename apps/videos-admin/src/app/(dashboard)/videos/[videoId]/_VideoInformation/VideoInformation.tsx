'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import { videoLabels, videoStatuses } from '../../../../../constants'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

import { VideoKeywords } from './VideoKeywords'

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
      primaryLanguageId
      keywords(languageId: $languageId) {
        id
        value
      }
      title(languageId: $languageId) {
        id
        value
      }
      variant {
        id
        slug
        language {
          id
          slug
        }
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
          label: values.label,
          keywordIds: values.keywords.map((k) => k.id)
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
        label: data.adminVideo.label ?? '',
        keywords: data.adminVideo.keywords ?? []
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
                spellCheck={true}
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
                alignItems: { xs: 'start', sm: 'end' },
                justifyContent: { sm: 'flex-end' }
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
              <Box sx={{ ml: 'auto' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  href={`${process.env.NEXT_PUBLIC_WATCH_URL ?? ''}/watch/${values.url}.html/${data.adminVideo.variant?.language.slug}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewIcon />}
                  aria-label="View public watch page"
                  sx={{
                    alignSelf: { xs: 'stretch', sm: 'center' },
                    whiteSpace: 'nowrap'
                  }}
                  disabled={
                    !(data.adminVideo.published && data.adminVideo.variant)
                  }
                >
                  View Public Page
                </Button>
              </Box>
            </Stack>
            <VideoKeywords
              primaryLanguageId={data.adminVideo.primaryLanguageId}
              initialKeywords={values.keywords}
              onChange={(keywords) =>
                handleChange({ target: { name: 'keywords', value: keywords } })
              }
            />
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

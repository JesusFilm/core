'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import WarningIcon from '@mui/icons-material/Warning'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
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
      snippet(languageId: $languageId) {
        id
        value
      }
      description(languageId: $languageId) {
        id
        value
      }
      imageAlt(languageId: $languageId) {
        id
        value
      }
      images {
        id
        aspectRatio
      }
      variant {
        id
        slug
        hls
        dash
        muxVideo {
          id
        }
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

  // Function to validate if video has all required data for publishing
  const validateVideoForPublishing = (currentLabel?: string): string[] => {
    const missingFields: string[] = []
    const video = data.adminVideo

    // Check if video has a title
    if (!video.title?.[0]?.value?.trim()) {
      missingFields.push('Title')
    }

    // Check if video has a snippet
    if (!video.snippet?.[0]?.value?.trim()) {
      missingFields.push('Short Description')
    }

    // Check if video has a description
    if (!video.description?.[0]?.value?.trim()) {
      missingFields.push('Description')
    }

    // Check if video has image alt text
    if (!video.imageAlt?.[0]?.value?.trim()) {
      missingFields.push('Image Alt Text')
    }

    // Check if video has at least one banner image (required for all videos)
    const hasBannerImage = video.images?.some(
      (image) => image.aspectRatio === 'banner'
    )
    if (!hasBannerImage) {
      missingFields.push('Banner Image')
    }

    // Check if video has at least one published variant with streaming data
    // Only required for content videos (not collections or series which are containers)
    // Use the current form label if provided, otherwise fall back to saved label
    const labelToCheck = currentLabel || video.label
    const isContainerVideo =
      labelToCheck === 'collection' || labelToCheck === 'series'

    if (!isContainerVideo) {
      const hasPublishedVariant =
        video.variant &&
        (video.variant.hls || video.variant.dash || video.variant.muxVideo?.id)
      if (!hasPublishedVariant) {
        missingFields.push('Published Video Content')
      }
    }

    return missingFields
  }

  // Component to show validation status when trying to publish
  const ValidationStatus = ({ values }: { values: FormikValues }) => {
    if (values.published !== 'published') return null

    const missingFields = validateVideoForPublishing(values.label)
    const video = data.adminVideo
    const isContainerVideo =
      values.label === 'collection' || values.label === 'series'

    // Only show alert if there are missing fields
    if (missingFields.length === 0) {
      return null
    }

    // Create field descriptions with explanations
    const fieldDescriptions: Record<string, string> = {
      Title: 'Video title is required',
      'Short Description': 'A brief description/snippet is required',
      Description: 'A full description is required',
      'Image Alt Text': 'Alt text for accessibility is required',
      'Banner Image':
        'Banner image (1280x600) is required for video thumbnails',
      'Published Video Content': isContainerVideo
        ? 'Not required for collections/series'
        : 'At least one published video variant with streaming content is required'
    }

    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <AlertTitle>Missing Required Fields</AlertTitle>
        The following fields must be completed before publishing:
        <List dense sx={{ mt: 1 }}>
          {missingFields.map((field) => (
            <ListItem key={field} sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <WarningIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={field}
                secondary={fieldDescriptions[field]}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    )
  }

  async function handleUpdateVideoInformation(
    values: FormikValues,
    { resetForm }: FormikProps<FormikValues>
  ): Promise<void> {
    // If trying to publish, validate required fields first
    if (values.published === 'published') {
      const missingFields = validateVideoForPublishing(values.label)
      if (missingFields.length > 0) {
        enqueueSnackbar(
          `Cannot publish video. Missing required fields: ${missingFields.join(', ')}. Please complete all required content before publishing.`,
          {
            variant: 'error',
            autoHideDuration: 8000
          }
        )
        return // Stop the submission
      }
    }

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
            <ValidationStatus values={values} />
            <Divider sx={{ mx: -4 }} />
            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <CancelButton show={dirty} handleCancel={() => resetForm()} />
              <SaveButton
                disabled={
                  !isValid ||
                  isSubmitting ||
                  !dirty ||
                  (values.published === 'published' &&
                    validateVideoForPublishing(values.label).length > 0)
                }
              />
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}

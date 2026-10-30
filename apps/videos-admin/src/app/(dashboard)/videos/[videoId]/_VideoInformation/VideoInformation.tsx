'use client'
import { CombinedGraphQLErrors } from '@apollo/client'
import { useMutation, useSuspenseQuery } from '@apollo/client/react'
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
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

import { CancelButton } from '../../../../../components/CancelButton'
import { SaveButton } from '../../../../../components/SaveButton'
import { videoLabels, videoStatuses } from '../../../../../constants'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

import { VideoKeywords } from './VideoKeywords'

interface VideoInformationProps {
  videoId: string
}

interface PendingSubmission {
  values: FormikValues
  helpers: FormikHelpers<FormikValues>
}

const jesusFilmUrl = 'jesusfilm.org/watch/'
const watchUrlPrefix = /^\s*(https?:\/\/)?(www\.)?jesusfilm\.org\/watch\//i

// The field displays the jesusfilm.org/watch/ prefix as an adornment, so a
// pasted full URL must be reduced to the slug before it reaches the API.
function stripWatchUrlPrefix(value: string): string {
  return value.replace(watchUrlPrefix, '')
}

function getSlugNotUniqueMessage(error: unknown): string | undefined {
  if (!CombinedGraphQLErrors.is(error)) return undefined

  const slugError = error.errors.find((graphQLError) => {
    if (graphQLError.extensions?.code !== 'NOT_UNIQUE_ERROR') return false
    const location = graphQLError.extensions?.location
    if (!Array.isArray(location)) return false
    return location.some(
      (entry) => Array.isArray(entry?.path) && entry.path.includes('slug')
    )
  })
  return slugError?.message
}

export const GET_VIDEO_INFORMATION = graphql(`
  query GetVideoInformation($id: ID!, $languageId: ID!) {
    adminVideo(id: $id) {
      id
      label
      published
      publishedAt
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
  const { enqueueSnackbar } = useSnackbar()
  const [createdTitleId, setCreatedTitleId] = useState<string | null>(null)
  const [pendingSlugChange, setPendingSlugChange] =
    useState<PendingSubmission | null>(null)

  // State to track validation attempts and errors
  const [validationAttempt, setValidationAttempt] = useState<{
    attempted: boolean
    errors: string[]
    values: FormikValues | null
  }>({
    attempted: false,
    errors: [],
    values: null
  })

  // State to track if current form values would pass validation for publishing
  const [hasValidationErrors, setHasValidationErrors] = useState(false)

  const validationSchema = object().shape({
    title: string()
      .trim()
      .required('Title is required')
      .max(60, 'Title must be 60 characters or less'),
    url: string().trim().required('URL is required'),
    published: string().required('Published is required'),
    label: string().required('Label is required')
  })

  const { data, refetch } = useSuspenseQuery(GET_VIDEO_INFORMATION, {
    variables: {
      id: videoId,
      languageId: DEFAULT_VIDEO_LANGUAGE_ID
    }
  })

  // If the query data is in sync, clear the local createdTitleId
  useEffect(() => {
    if (createdTitleId && data.adminVideo.title?.[0]?.id) {
      setCreatedTitleId(null)
    }
  }, [createdTitleId, data.adminVideo.title])

  // Function to validate if video has all required data for publishing
  const validateVideoForPublishing = async (
    currentLabel?: string,
    currentTitle?: string
  ): Promise<string[]> => {
    // Re-query to get the most up-to-date data
    const { data: freshData } = await refetch()
    const missingFields: string[] = []
    const video = freshData?.adminVideo
    if (video == null) return ['Title']

    // Check if video has a title - use current form value if provided, otherwise use saved value
    const titleToCheck = currentTitle?.trim() || video.title?.[0]?.value?.trim()
    if (!titleToCheck) {
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

  // Function to attempt publishing and handle validation
  const attemptPublish = async (
    values: FormikValues,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const missingFields = await validateVideoForPublishing(
      values.label,
      values.title
    )

    if (missingFields.length > 0) {
      // Revert to draft and show validation errors
      setFieldValue('published', 'unpublished')
      setValidationAttempt({
        attempted: true,
        errors: missingFields,
        values
      })
      setHasValidationErrors(true)
      return false
    }

    // Clear validation attempt state if validation passes
    setValidationAttempt({
      attempted: false,
      errors: [],
      values: null
    })
    setHasValidationErrors(false)
    return true
  }

  // Component to show validation status after failed publish attempt
  const ValidationStatus = ({
    values,
    setFieldValue
  }: {
    values: FormikValues
    setFieldValue: (field: string, value: any) => void
  }) => {
    // Show validation errors if there was an attempt to publish that failed
    if (!validationAttempt.attempted || validationAttempt.errors.length === 0) {
      return null
    }

    const isContainerVideo =
      values.label === 'collection' || values.label === 'series'

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

    const handleTryAgain = async () => {
      // Clear current validation state first
      setValidationAttempt({
        attempted: false,
        errors: [],
        values: null
      })

      // Attempt to publish again with current form values
      const canPublish = await attemptPublish(values, setFieldValue)
      if (canPublish) {
        // If validation passes, set status to published
        setFieldValue('published', 'published')
      }
      // If validation fails, attemptPublish will handle setting the errors and reverting status
    }

    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Cannot Publish - Missing Required Fields</AlertTitle>The
        following fields must be completed before publishing:
        <List dense sx={{ mt: 1, mb: 2 }}>
          {validationAttempt.errors.map((field) => (
            <ListItem key={field} sx={{ py: 0 }}>
              <ListItemIcon sx={{ minWidth: 24 }}>
                <WarningIcon color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={field}
                secondary={fieldDescriptions[field]}
                slotProps={{
                  secondary: { sx: { fontSize: '0.75rem' } }
                }}
              />
            </ListItem>
          ))}
        </List>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={handleTryAgain}
          sx={{ mt: 1 }}
        >
          Try Again
        </Button>
      </Alert>
    )
  }

  async function handleSubmit(
    values: FormikValues,
    helpers: FormikHelpers<FormikValues>
  ): Promise<void> {
    const slugChanged = values.url.trim() !== data.adminVideo.slug
    // A published video's URL is live on Watch, so renaming it needs an
    // explicit confirmation before anything is sent.
    if (data.adminVideo.published === true && slugChanged) {
      setPendingSlugChange({ values, helpers })
      return
    }
    await handleUpdateVideoInformation(values, helpers)
  }

  async function handleConfirmSlugChange(): Promise<void> {
    if (pendingSlugChange == null) return
    const { values, helpers } = pendingSlugChange
    setPendingSlugChange(null)
    // Formik finished its own submit when the dialog opened, so keep Save
    // disabled while the confirmed update runs.
    helpers.setSubmitting(true)
    try {
      await handleUpdateVideoInformation(values, helpers)
    } finally {
      helpers.setSubmitting(false)
    }
  }

  function handleCancelSlugChange(): void {
    setPendingSlugChange(null)
  }

  async function handleUpdateVideoInformation(
    values: FormikValues,
    { resetForm, setFieldError }: FormikHelpers<FormikValues>
  ): Promise<void> {
    // If trying to publish, validate required fields first
    if (values.published === 'published') {
      const missingFields = await validateVideoForPublishing(values.label)
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

    let titleId = data.adminVideo.title[0]?.id ?? createdTitleId
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
      setCreatedTitleId(titleId)
    }

    if (!titleId) {
      enqueueSnackbar('No title ID available for update', { variant: 'error' })
      return
    }

    try {
      await updateVideoInformation({
        variables: {
          infoInput: {
            id: videoId,
            slug: values.url.trim(),
            published: values.published === 'published',
            label: values.label,
            keywordIds: values.keywords.map((k) => k.id)
          },
          titleInput: {
            id: titleId,
            value: values.title
          }
        }
      })
    } catch (error) {
      // Apollo Client 4 rejects the mutate promise on GraphQL errors.
      const slugNotUniqueMessage = getSlugNotUniqueMessage(error)
      if (slugNotUniqueMessage != null) {
        setFieldError('url', slugNotUniqueMessage)
        return
      }
      enqueueSnackbar('Failed to update video information', {
        variant: 'error'
      })
      return
    }

    enqueueSnackbar('Successfully updated video information', {
      variant: 'success'
    })
    resetForm({ values: { ...values, url: values.url.trim() } })
    router.push('?', { scroll: false })
  }

  // Handle status change with validation attempt
  const handleStatusChange = async (
    event: any,
    setFieldValue: (field: string, value: any) => void,
    values: FormikValues
  ) => {
    const newStatus = event.target.value

    if (newStatus === 'published') {
      // Attempt to validate for publishing
      const canPublish = await attemptPublish(values, setFieldValue)
      if (!canPublish) {
        // attemptPublish already reverted to unpublished and set validation errors
        return
      }
    } else {
      // Clear validation attempt state when switching to draft
      setValidationAttempt({
        attempted: false,
        errors: [],
        values: null
      })
      setHasValidationErrors(false)
    }

    setFieldValue('published', newStatus)
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
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({
        values,
        errors,
        handleChange,
        isValid,
        isSubmitting,
        dirty,
        resetForm,
        setFieldValue
      }) => (
        <Form>
          <Stack
            sx={{
              gap: 2
            }}
          >
            <Stack
              sx={{
                gap: 2,
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
                helperText={
                  errors.title
                    ? (errors.title as string)
                    : `${values.title.length}/60`
                }
                sx={{ flexGrow: 1 }}
                slotProps={{
                  htmlInput: { maxLength: 60 }
                }}
              />
              <TextField
                id="url"
                name="url"
                label="Video URL"
                fullWidth
                value={values.url}
                variant="outlined"
                error={Boolean(errors.url)}
                onChange={(event) =>
                  setFieldValue('url', stripWatchUrlPrefix(event.target.value))
                }
                helperText={
                  errors.url
                    ? (errors.url as string)
                    : 'Changing the URL keeps the old one working as a redirect.'
                }
                sx={{ flexGrow: 1 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {jesusFilmUrl}
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Stack>
            <Stack
              sx={{
                gap: 2,
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
                  onChange={(event) =>
                    handleStatusChange(event, setFieldValue, values)
                  }
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
                  href={`${process.env.NEXT_PUBLIC_WATCH_URL ?? ''}/watch/${data.adminVideo.slug}.html/${data.adminVideo.variant?.language.slug}.html`}
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
                handleChange({
                  target: { name: 'keywords', value: keywords }
                })
              }
            />
            <ValidationStatus values={values} setFieldValue={setFieldValue} />
            <Divider sx={{ mx: -4 }} />
            <Stack
              direction="row"
              sx={{
                justifyContent: 'flex-end',
                gap: 1
              }}
            >
              <CancelButton show={dirty} handleCancel={() => resetForm()} />
              <SaveButton
                disabled={
                  !isValid ||
                  isSubmitting ||
                  !dirty ||
                  (values.published === 'published' && hasValidationErrors)
                }
                loading={isSubmitting}
              />
            </Stack>
          </Stack>
          <Dialog
            open={pendingSlugChange != null}
            onClose={handleCancelSlugChange}
            dialogTitle={{ title: 'Change Video URL?', closeButton: true }}
            dialogAction={{
              onSubmit: () => void handleConfirmSlugChange(),
              submitLabel: 'Change URL',
              closeLabel: 'Cancel'
            }}
          >
            <Typography variant="body1">
              {`This video is published. Its URL will change from ${jesusFilmUrl}${data.adminVideo.slug} to ${jesusFilmUrl}${pendingSlugChange?.values.url.trim() ?? ''}. The old URL will keep working as a redirect.`}
            </Typography>
          </Dialog>
        </Form>
      )}
    </Formik>
  )
}

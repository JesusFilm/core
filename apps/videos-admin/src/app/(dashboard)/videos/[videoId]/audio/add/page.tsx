'use client'

import { useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { ReactElement, useRef } from 'react'
import { mixed, object, string } from 'yup'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { videoStatuses } from '../../../../../../constants'
import { useUploadVideoVariant } from '../../../../../_UploadVideoVariantProvider'

import { AudioLanguageFileUpload } from './_AudioLanguageFileUpload'

interface AddAudioLanguageDialogProps {
  params: {
    videoId: string
  }
}

const validationSchema = object().shape({
  edition: string().required('Edition is required'),
  language: object().nullable().required('Language is required'),
  file: mixed().required('Video file is required')
})

const initialValues: FormikValues = {
  edition: 'base',
  language: null,
  file: null,
  published: 'unpublished'
}

const GET_ADMIN_VIDEO_VARIANTS = graphql(`
  query GetAdminVideoVariants($id: ID!) {
    adminVideo(id: $id) {
      slug
      variants {
        id
        language {
          id
        }
      }
      videoEditions {
        id
        name
      }
    }
  }
`)

export default function AddAudioLanguageDialog({
  params: { videoId }
}: AddAudioLanguageDialogProps): ReactElement {
  const router = useRouter()
  const { uploadState, startUpload, clearUploadState } = useUploadVideoVariant()

  const formikRef = useRef<FormikProps<FormikValues>>(null)

  const { data, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  const { data: variantsData } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANTS, {
    variables: { id: videoId }
  })

  const availableLanguages = data?.languages?.filter(
    (language) =>
      !variantsData.adminVideo.variants.some(
        (variant) => variant.language.id === language.id
      )
  )

  const returnUrl = `/videos/${videoId}/audio`
  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (values.language == null || values.file == null) return
    const videoSlug = variantsData.adminVideo.slug
    if (!videoSlug) return
    await startUpload(
      values.file,
      videoId,
      values.language.id,
      values.language.slug,
      values.edition,
      values.published === 'published',
      videoSlug,
      () => {
        router.push(returnUrl, {
          scroll: false
        })
      }
    )
  }

  const isUploadInProgress = uploadState.isUploading || uploadState.isProcessing
  const handleDialogClose = (): void => {
    // Don't close the dialog if upload is in progress
    if (isUploadInProgress) {
      return
    }
    router.push(returnUrl, {
      scroll: false
    })
  }

  return (
    <Dialog
      open={true}
      onClose={handleDialogClose}
      dialogTitle={{
        title: 'Add Audio Language',
        closeButton: true
      }}
      divider
      slotProps={{
        titleButton: {
          disabled: isUploadInProgress
        }
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        innerRef={formikRef}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            <Stack gap={4}>
              <Stack gap={2}>
                <FormControl
                  fullWidth
                  error={touched.edition && errors.edition != null}
                >
                  <InputLabel id="edition-label">Edition</InputLabel>
                  <Select
                    labelId="edition-label"
                    data-testid="EditionSelect"
                    id="edition"
                    name="edition"
                    label="Edition"
                    error={touched.edition && errors.edition != null}
                    value={values.edition}
                    onChange={async (event) => {
                      await setFieldValue('edition', event.target.value)
                    }}
                    disabled={isUploadInProgress}
                  >
                    {variantsData.adminVideo.videoEditions.map(
                      (edition) =>
                        edition?.name != null && (
                          <MenuItem key={edition.id} value={edition.name}>
                            {edition.name}
                          </MenuItem>
                        )
                    )}
                  </Select>
                  <FormHelperText>
                    {touched.edition && errors.edition
                      ? (errors.edition as string)
                      : undefined}
                  </FormHelperText>
                </FormControl>
                <Box sx={{ width: '100%' }}>
                  <LanguageAutocomplete
                    onChange={async (value) => {
                      await setFieldValue('language', value)
                    }}
                    languages={availableLanguages}
                    loading={languagesLoading}
                    disabled={isUploadInProgress}
                    value={values.language ?? undefined}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Language"
                        variant="outlined"
                        error={touched.language && errors.language != null}
                        helperText={
                          touched.language && errors.language
                            ? (errors.language as string)
                            : undefined
                        }
                      />
                    )}
                  />
                </Box>
                <FormControl variant="standard">
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status"
                    name="published"
                    label="Status"
                    value={values.published}
                    onChange={async (event) => {
                      await setFieldValue('published', event.target.value)
                    }}
                    disabled={isUploadInProgress}
                  >
                    {videoStatuses.map(({ label, value }) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <AudioLanguageFileUpload
                  disabled={isUploadInProgress}
                  onFileSelect={async (file) => {
                    await setFieldValue('file', file)
                  }}
                  error={
                    touched.file && errors.file
                      ? (errors.file as string)
                      : (uploadState.error ?? undefined)
                  }
                  loading={languagesLoading}
                  uploading={uploadState.isUploading}
                  processing={uploadState.isProcessing}
                  selectedFile={values.file}
                  uploadProgress={uploadState.uploadProgress}
                  clearUploadState={clearUploadState}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    disabled={
                      languagesLoading ||
                      isUploadInProgress ||
                      values.language == null ||
                      values.edition === '' ||
                      values.file == null
                    }
                  >
                    Add
                  </Button>
                </Box>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

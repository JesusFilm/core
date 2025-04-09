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
import { useParams } from 'next/navigation'
import { ReactElement, useRef } from 'react'
import { mixed, object, string } from 'yup'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete/LanguageAutocomplete'

import { videoStatuses } from '../../../../../../../constants'
import { useUploadVideoVariant } from '../../../../../../../libs/UploadVideoVariantProvider'
import {
  GetAdminVideoVariant,
  GetAdminVideo_AdminVideo_VideoEditions as VideoEditions
} from '../../../../../../../libs/useAdminVideo'

import { AudioLanguageFileUpload } from './AudioLanguageFileUpload/AudioLanguageFileUpload'

interface AddAudioLanguageDialogProps {
  open?: boolean
  handleClose?: () => void
  variantLanguagesMap: Map<string, GetAdminVideoVariant>
  editions?: VideoEditions
}

const validationSchema = object().shape({
  edition: string().required('Edition is required'),
  language: object().nullable().required('Language is required'),
  file: mixed().required('Video file is required')
})

const initialValues: FormikValues = {
  edition: '',
  language: null,
  file: null,
  published: 'published'
}

export function AddAudioLanguageDialog({
  open,
  handleClose,
  variantLanguagesMap,
  editions
}: AddAudioLanguageDialogProps): ReactElement {
  const params = useParams<{ videoId: string }>()
  const { uploadState, startUpload } = useUploadVideoVariant()

  const formikRef = useRef<FormikProps<FormikValues>>(null)

  const { data, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  const availableLanguages = data?.languages?.filter(
    (language) => !variantLanguagesMap.has(language.id)
  )

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (
      values.language == null ||
      params?.videoId == null ||
      values.file == null
    )
      return
    await startUpload(
      values.file,
      params.videoId,
      values.language.id,
      values.language.slug,
      values.edition,
      () => {
        // Call handleClose first so it can be tested properly
        handleClose?.()
        // Then reload the page to get updated data
        window.location.reload()
      },
      values.published === 'published'
    )
  }

  const isUploadInProgress = uploadState.isUploading || uploadState.isProcessing

  const handleDialogClose = (): void => {
    // Don't close the dialog if upload is in progress
    if (isUploadInProgress) {
      return
    }
    handleClose?.()
  }

  return (
    <Dialog
      open={open ?? false}
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
                    {editions?.map(
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

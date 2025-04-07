import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { mixed, object, string } from 'yup'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete/LanguageAutocomplete'

import { useUploadVideoVariant } from '../../../../../../../libs/UploadVideoVariantProvider'
import {
  GetAdminVideoVariant,
  GetAdminVideo_AdminVideo_VideoEditions as VideoEditions
} from '../../../../../../../libs/useAdminVideo'

import { AudioLanguageFileUpload } from './AudioLanguageFileUpload/AudioLanguageFileUpload'

const TRANSCODE_ASSET = graphql(`
  mutation TranscodeAsset($input: TranscodeVideoInput!) {
    transcodeAsset(input: $input)
  }
`)

const GET_TRANSCODE_ASSET_PROGRESS = graphql(`
  mutation GetTranscodeAssetProgress($jobId: String!) {
    getTranscodeAssetProgress(jobId: $jobId)
  }
`)

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
  file: null
}

export function AddAudioLanguageDialog({
  open,
  handleClose,
  variantLanguagesMap,
  editions
}: AddAudioLanguageDialogProps): ReactElement {
  const params = useParams<{ videoId: string }>()
  const { uploadState, startUpload } = useUploadVideoVariant()
  const [transcodeJobId, setTranscodeJobId] = useState<string | null>(null)
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0)
  const [isTranscoding, setIsTranscoding] = useState<boolean>(false)
  const [transcodeError, setTranscodeError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const formikRef = useRef<FormikProps<FormikValues>>(null)

  const { data, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
  })

  const [transcodeAsset] = useMutation(TRANSCODE_ASSET)
  const [getTranscodeAssetProgress] = useMutation(GET_TRANSCODE_ASSET_PROGRESS)

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
      handleClose
    )
  }

  const isUploadInProgress =
    uploadState.isUploading || uploadState.isProcessing || isTranscoding

  const handleDialogClose = (): void => {
    // Don't close the dialog if upload is in progress
    if (isUploadInProgress) {
      return
    }
    setTranscodeJobId(null)
    setTranscodeProgress(0)
    setIsTranscoding(false)
    setTranscodeError(null)
    setUploadedFile(null)
    handleClose?.()
  }

  const handleTranscode = async (): Promise<void> => {
    if (!uploadState.r2AssetId || !uploadedFile || !params?.videoId) return

    try {
      setIsTranscoding(true)
      setTranscodeError(null)

      // Create HQ filename for output
      const filenameParts = uploadedFile.name.split('.')
      const fileExtension = filenameParts.pop() || ''
      const filename = filenameParts.join('.')
      const hqFilename = `${filename}-hq.${fileExtension}`

      const { data } = await transcodeAsset({
        variables: {
          input: {
            r2AssetId: uploadState.r2AssetId,
            resolution: '720p',
            videoBitrate: '2500',
            outputFilename: hqFilename,
            outputPath: `/videos/${params.videoId}`
          }
        }
      })

      if (data?.transcodeAsset) {
        setTranscodeJobId(data.transcodeAsset)
      }
    } catch (error) {
      setTranscodeError(
        error instanceof Error ? error.message : 'Failed to start transcoding'
      )
      setIsTranscoding(false)
    }
  }

  // Poll for transcode progress
  useEffect(() => {
    if (!transcodeJobId) return

    const interval = setInterval(async () => {
      try {
        const { data } = await getTranscodeAssetProgress({
          variables: {
            jobId: transcodeJobId
          }
        })

        if (data?.getTranscodeAssetProgress != null) {
          setTranscodeProgress(data.getTranscodeAssetProgress)

          // If progress is 100%, stop polling
          if (data.getTranscodeAssetProgress === 100) {
            setIsTranscoding(false)
            clearInterval(interval)
          }
        }
      } catch (error) {
        setTranscodeError(
          error instanceof Error
            ? error.message
            : 'Failed to get transcoding progress'
        )
        setIsTranscoding(false)
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [transcodeJobId, getTranscodeAssetProgress])

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
                {uploadedFile &&
                  uploadState.muxVideoId &&
                  !uploadState.isProcessing &&
                  !uploadState.isUploading && (
                    <Box>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleTranscode}
                        disabled={
                          isTranscoding ||
                          uploadState.isUploading ||
                          uploadState.isProcessing ||
                          !uploadState.r2AssetId
                        }
                        sx={{ mt: 1 }}
                      >
                        Create HQ
                      </Button>
                      {!uploadState.r2AssetId && (
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          R2 asset not available for transcoding
                        </Typography>
                      )}
                      {isTranscoding && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Transcoding to 720p (2500kbps)...
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={transcodeProgress}
                            sx={{ height: 10, borderRadius: 1 }}
                          />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="right"
                            sx={{ mt: 0.5 }}
                          >
                            {transcodeProgress}%
                          </Typography>
                        </Box>
                      )}
                      {transcodeError && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {transcodeError}
                        </Typography>
                      )}
                    </Box>
                  )}
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

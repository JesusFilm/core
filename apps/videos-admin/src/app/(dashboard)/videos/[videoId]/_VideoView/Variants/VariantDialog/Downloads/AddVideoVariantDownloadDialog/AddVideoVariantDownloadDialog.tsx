import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { LinkFile } from '../../../../../../../../../components/LinkFile'
import {
  uploadAssetFile,
  useCreateR2AssetMutation
} from '../../../../../../../../../libs/useCreateR2Asset'
import { useVideoVariantDownloadCreateMutation } from '../../../../../../../../../libs/useVideoVariantDownloadCreateMutation'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'
import { getExtension } from '../../../AddAudioLanguageDialog/utils/getExtension'

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

interface AddVideoVariantDownloadDialogProps {
  open: boolean
  handleClose?: () => void
  onSuccess?: () => void
  videoVariantId: string
  existingQualities: string[]
  languageId: string
  assetId?: string | null
}

export function AddVideoVariantDownloadDialog({
  open,
  handleClose,
  onSuccess,
  videoVariantId,
  languageId,
  existingQualities,
  assetId
}: AddVideoVariantDownloadDialogProps): ReactElement {
  const params = useParams<{ videoId: string; locale: string }>()
  const videoId = params?.videoId
  const [createVideoVariantDownload] = useVideoVariantDownloadCreateMutation()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [createR2Asset] = useCreateR2AssetMutation()
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [transcodeJobId, setTranscodeJobId] = useState<string | null>(null)
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0)
  const [isTranscoding, setIsTranscoding] = useState<boolean>(false)
  const [transcodeError, setTranscodeError] = useState<string | null>(null)

  const [transcodeAsset] = useMutation(TRANSCODE_ASSET)
  const [getTranscodeAssetProgress] = useMutation(GET_TRANSCODE_ASSET_PROGRESS)

  const handleUpload = async (file: File): Promise<void> => {
    if (!file) return
    const video = document.createElement('video')
    function cleanup() {
      URL.revokeObjectURL(video.src)
      video.remove()
    }
    video.onerror = function () {
      cleanup()
      enqueueSnackbar('Failed to load video', {
        variant: 'error'
      })
    }
    video.src = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      setVideoDimensions({ width: video.videoWidth, height: video.videoHeight })
      cleanup()
    }
    setUploadedFile(file)
    return
  }

  const initialValues: FormikValues = {
    quality: 'high',
    file: null
  }

  const validationSchema = object({
    quality: string()
      .required('Quality is required')
      .test(
        'unique-quality',
        'A download with this quality already exists',
        (value) => {
          // Strip "generate-" prefix for validation
          const baseQuality = value.replace('generate-', '')
          return !existingQualities.includes(baseQuality)
        }
      ),
    file: string().when('quality', {
      is: (val: string) => !val.startsWith('generate-'),
      then: (schema) => schema.required('File is required'),
      otherwise: (schema) => schema.optional()
    })
  })

  const startTranscoding = async (
    resolution: string,
    bitrate: string,
    quality: string
  ): Promise<void> => {
    if (!assetId || !videoId) {
      setTranscodeError('Asset or video ID not available')
      return
    }

    try {
      setIsTranscoding(true)
      setTranscodeError(null)

      // Generate a filename for the transcoded version
      const timestamp = Date.now()
      const outputFilename = `${quality}-${languageId}-${timestamp}.mp4`

      const { data } = await transcodeAsset({
        variables: {
          input: {
            r2AssetId: assetId,
            resolution,
            videoBitrate: bitrate,
            outputFilename,
            outputPath: `/videos/${videoId}`
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
            // When complete, call onSuccess to refresh the download list
            onSuccess?.()
            // Close the dialog
            handleClose?.()
            // Show success message
            enqueueSnackbar('Download created successfully', {
              variant: 'success'
            })
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
  }, [transcodeJobId, getTranscodeAssetProgress, onSuccess, handleClose])

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    // Handle generate qualities
    if (values.quality.startsWith('generate-')) {
      const quality = values.quality.replace('generate-', '')

      if (quality === 'high') {
        await startTranscoding('720p', '2500', 'high')
      } else if (quality === 'low') {
        await startTranscoding('270p', '500', 'low')
      }

      return
    }

    // Handle regular file upload
    if (uploadedFile == null || videoDimensions == null || videoId == null)
      return
    const extension = getExtension(values.file.name)
    const r2Asset = await createR2Asset({
      variables: {
        input: {
          videoId: videoId,
          fileName: `${videoId}/variants/${languageId}/downloads/${videoVariantId}_${values.quality}${extension}`,
          contentType: uploadedFile.type,
          contentLength: uploadedFile.size
        }
      }
    })
    const uploadUrl = r2Asset.data?.cloudflareR2Create?.uploadUrl
    try {
      if (uploadUrl == null) throw new Error('Upload URL is null')
      await uploadAssetFile(uploadedFile, uploadUrl)
    } catch (error) {
      console.log(error)
      enqueueSnackbar('Failed to upload file', {
        variant: 'error'
      })
      return
    }
    const publicUrl = r2Asset.data?.cloudflareR2Create?.publicUrl

    if (publicUrl != null) {
      await createVideoVariantDownload({
        variables: {
          input: {
            videoVariantId,
            quality: values.quality,
            size: uploadedFile.size,
            height: videoDimensions.height,
            width: videoDimensions.width,
            url: publicUrl,
            version: 0,
            assetId: r2Asset.data?.cloudflareR2Create?.id
          }
        },
        onError: () => {
          enqueueSnackbar('Failed to create download', {
            variant: 'error'
          })
        },
        onCompleted: () => {
          enqueueSnackbar('Download created', {
            variant: 'success'
          })
          onSuccess?.()
        }
      })
    }
    handleClose?.()
  }

  const isGenerateOption = (quality: string): boolean => {
    return quality.startsWith('generate-')
  }

  const getButtonText = (quality: string): string => {
    return isGenerateOption(quality) ? 'Generate' : 'Add'
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="add-download-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="add-download-dialog-title">Add Download</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          isSubmitting,
          setFieldValue,
          handleSubmit,
          handleChange,
          values
        }) => (
          <Form onSubmit={handleSubmit}>
            <DialogContent>
              <Stack gap={2}>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={touched.quality && Boolean(errors.quality)}
                >
                  <InputLabel id="quality-label">Quality</InputLabel>
                  <Select
                    name="quality"
                    value={values.quality}
                    labelId="quality-label"
                    label="Quality"
                    error={touched.quality && Boolean(errors.quality)}
                    onChange={handleChange}
                  >
                    <MenuItem value="high">high (Upload)</MenuItem>
                    <MenuItem value="low">low (Upload)</MenuItem>
                    <MenuItem value="generate-high" disabled={!assetId}>
                      Generate high{!assetId ? ' (master unavailable)' : ''}
                    </MenuItem>
                    <MenuItem value="generate-low" disabled={!assetId}>
                      Generate low{!assetId ? ' (master unavailable)' : ''}
                    </MenuItem>
                  </Select>
                  <FormHelperText sx={{ minHeight: 20 }}>
                    {errors.quality != null &&
                      typeof errors.quality === 'string' &&
                      errors.quality}
                    {!assetId &&
                      isGenerateOption(values.quality) &&
                      'No asset available for transcoding'}
                  </FormHelperText>
                </FormControl>

                {!isGenerateOption(values.quality) ? (
                  <>
                    <FileUpload
                      accept={{ 'video/*': [] }}
                      loading={false}
                      onDrop={async (file) => {
                        await setFieldValue('file', file)
                        await handleUpload(file)
                      }}
                    />

                    {uploadedFile != null && (
                      <LinkFile
                        name={uploadedFile.name}
                        link={URL.createObjectURL(uploadedFile)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {!assetId && (
                      <Typography variant="body2" color="text.secondary">
                        No asset available for transcoding. Please upload an
                        audio variant first.
                      </Typography>
                    )}
                    {assetId && (
                      <Typography variant="body2" color="text.secondary">
                        This will generate a{' '}
                        {values.quality === 'generate-high'
                          ? 'high quality (720p, 2500kbps)'
                          : 'low quality (270p, 500kbps)'}{' '}
                        download from the existing asset.
                      </Typography>
                    )}
                  </>
                )}

                {isTranscoding && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Transcoding{' '}
                      {values.quality === 'generate-high'
                        ? 'to 720p (2500kbps)'
                        : 'to 270p (500kbps)'}
                      ...
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
                  <Typography color="error" variant="body2">
                    {transcodeError}
                  </Typography>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isTranscoding ||
                  (isGenerateOption(values.quality) && !assetId) ||
                  (!isGenerateOption(values.quality) && !uploadedFile)
                }
                variant="contained"
              >
                {getButtonText(values.quality)}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

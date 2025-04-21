'use client'

import { useMutation, useQuery, useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
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
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { FileUpload } from '../../../../../../../../../components/FileUpload'
import { LinkFile } from '../../../../../../../../../components/LinkFile'
import {
  uploadAssetFile,
  useCreateR2AssetMutation
} from '../../../../../../../../../libs/useCreateR2Asset'
import { getExtension } from '../../../../add/_utils/getExtension'

interface AddVideoVariantDownloadDialogProps {
  params: {
    videoId: string
    variantId: string
    downloadId: string
  }
}

const GET_ADMIN_VIDEO_VARIANT = graphql(`
  query GetAdminVideoVariant($id: ID!) {
    videoVariant(id: $id) {
      id
      asset {
        id
      }
      downloads {
        id
        quality
      }
    }
  }
`)

const VIDEO_VARIANT_DOWNLOAD_CREATE = graphql(`
  mutation VideoVariantDownloadCreate(
    $input: VideoVariantDownloadCreateInput!
  ) {
    videoVariantDownloadCreate(input: $input) {
      id
      quality
      size
      height
      width
      url
      version
    }
  }
`)

const TRANSCODE_ASSET = graphql(`
  mutation TranscodeAsset($input: TranscodeVideoInput!) {
    transcodeAsset(input: $input)
  }
`)

const GET_TRANSCODE_ASSET_PROGRESS = graphql(`
  query GetTranscodeAssetProgress($jobId: String!) {
    getTranscodeAssetProgress(jobId: $jobId)
  }
`)

export default function AddVideoVariantDownloadDialog({
  params: { videoId, variantId, downloadId: languageId }
}: AddVideoVariantDownloadDialogProps): ReactElement {
  const router = useRouter()
  const [createVideoVariantDownload] = useMutation(
    VIDEO_VARIANT_DOWNLOAD_CREATE
  )
  const [transcodeAsset] = useMutation(TRANSCODE_ASSET)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [createR2Asset] = useCreateR2AssetMutation()
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTranscoding, setIsTranscoding] = useState(false)
  const [transcodeJobId, setTranscodeJobId] = useState<string | null>(null)
  const [transcodeProgress, setTranscodeProgress] = useState<number | null>(
    null
  )
  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANT, {
    variables: { id: variantId }
  })

  const { data: transcodeData, refetch } = useQuery(
    GET_TRANSCODE_ASSET_PROGRESS,
    {
      variables: { jobId: transcodeJobId ?? '' },
      skip: transcodeJobId == null
    }
  )

  const returnUrl = `/videos/${videoId}/audio/${variantId}`
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

  const startTranscoding = async (
    resolution: string,
    bitrate: string,
    quality: string
  ): Promise<void> => {
    if (data.videoVariant.asset?.id == null) {
      return
    }

    try {
      setIsTranscoding(true)

      // Generate a filename for the transcoded version
      const timestamp = Date.now()
      const outputFilename = `${quality}-${languageId}-${timestamp}.mp4`

      const { data: transcodeData } = await transcodeAsset({
        variables: {
          input: {
            r2AssetId: data.videoVariant.asset.id,
            resolution,
            videoBitrate: bitrate,
            outputFilename,
            outputPath: `${videoId}/variants/${languageId}/downloads`
          }
        }
      })

      if (transcodeData?.transcodeAsset) {
        setTranscodeJobId(transcodeData.transcodeAsset)
      }
    } catch (_error) {
      enqueueSnackbar('Failed to start transcoding', {
        variant: 'error'
      })
      setIsTranscoding(false)
    }
  }

  const initialValues: FormikValues = {
    quality: 'high',
    file: null
  }

  const existingQualities = data.videoVariant.downloads.map(
    (download) => download.quality
  )

  const validationSchema = object({
    quality: string()
      .oneOf(['high', 'low'], 'Quality must be either high or low')
      .required('Quality is required')
      .test(
        'unique-quality',
        'A download with this quality already exists',
        (value) => {
          const baseQuality = value.replace('generate-', '')
          return !existingQualities.includes(baseQuality as 'high' | 'low')
        }
      ),
    file: string().when('quality', {
      is: (val: string) => !val.startsWith('generate-'),
      then: (schema) => schema.required('File is required'),
      otherwise: (schema) => schema.optional()
    })
  })

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
    setIsLoading(true)
    try {
      const extension = getExtension(values.file.name)
      const r2Asset = await createR2Asset({
        variables: {
          input: {
            videoId: videoId,
            fileName: `${videoId}/variants/${languageId}/downloads/${variantId}_${values.quality}${extension}`,
            originalFilename: values.file.name,
            contentType: uploadedFile.type,
            contentLength: uploadedFile.size
          }
        }
      })
      const uploadUrl = r2Asset.data?.cloudflareR2Create?.uploadUrl
      if (uploadUrl == null) throw new Error('Upload URL is null')
      await uploadAssetFile(uploadedFile, uploadUrl)
      const publicUrl = r2Asset.data?.cloudflareR2Create?.publicUrl

      if (publicUrl != null) {
        await createVideoVariantDownload({
          variables: {
            input: {
              videoVariantId: variantId,
              quality: values.quality,
              size: uploadedFile.size,
              height: videoDimensions.height,
              width: videoDimensions.width,
              url: publicUrl,
              version: 0,
              assetId: r2Asset.data?.cloudflareR2Create?.id
            }
          }
        })
        enqueueSnackbar('Download created', { variant: 'success' })
        router.push(returnUrl, { scroll: false })
      }
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Failed to create download', {
        variant: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!transcodeJobId) return

    const interval = setInterval(async () => {
      try {
        await refetch()

        if (transcodeData?.getTranscodeAssetProgress != null) {
          setTranscodeProgress(transcodeData.getTranscodeAssetProgress)

          // If progress is 100%, stop polling
          if (transcodeData.getTranscodeAssetProgress === 100) {
            setIsTranscoding(false)
            enqueueSnackbar('Download created successfully', {
              variant: 'success'
            })

            clearInterval(interval)
            router.push(returnUrl, { scroll: false })
          }
        }
      } catch (_error) {
        enqueueSnackbar('Failed to transcode', {
          variant: 'error'
        })
        setIsTranscoding(false)
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [transcodeJobId, transcodeProgress])

  const isGenerateOption = (quality: string): boolean => {
    return quality.startsWith('generate-')
  }

  const getButtonText = (quality: string): string => {
    return isGenerateOption(quality) ? 'Generate' : 'Add'
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        touched,
        setFieldValue,
        handleChange,
        values,
        submitForm
      }) => (
        <Dialog
          open={true}
          onClose={() =>
            router.push(returnUrl, {
              scroll: false
            })
          }
          dialogTitle={{
            title: 'Add Download',
            closeButton: true
          }}
          dialogAction={{
            onSubmit: submitForm,
            submitLabel: getButtonText(values.quality),
            closeLabel: 'Cancel'
          }}
          loading={isLoading}
        >
          <Form>
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
                  <MenuItem value="high">high</MenuItem>
                  <MenuItem value="low">low</MenuItem>
                  <MenuItem
                    value="generate-high"
                    disabled={!data.videoVariant.asset?.id}
                  >
                    Generate high
                    {!data.videoVariant.asset?.id
                      ? ' (master unavailable)'
                      : ''}
                  </MenuItem>
                  <MenuItem
                    value="generate-low"
                    disabled={!data.videoVariant.asset?.id}
                  >
                    Generate low
                    {!data.videoVariant.asset?.id
                      ? ' (master unavailable)'
                      : ''}
                  </MenuItem>
                </Select>
                <FormHelperText sx={{ minHeight: 20 }}>
                  {errors.quality != null &&
                    typeof errors.quality === 'string' &&
                    errors.quality}
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
                  {!data.videoVariant.asset?.id && (
                    <Typography variant="body2" color="text.secondary">
                      No asset available for transcoding. Please upload an audio
                      variant first.
                    </Typography>
                  )}
                  {data.videoVariant.asset?.id && (
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
                    value={transcodeProgress ?? 0}
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
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}

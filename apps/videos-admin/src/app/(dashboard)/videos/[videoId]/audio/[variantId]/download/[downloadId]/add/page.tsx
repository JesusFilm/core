'use client'

import { useMutation, useQuery, useSuspenseQuery } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

import { graphql } from '@core/shared/gql'
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
      muxVideo {
        id
        playbackId
      }
      downloads {
        id
        quality
        asset {
          id
        }
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

const ENABLE_MUX_DOWNLOAD = graphql(`
  mutation EnableMuxDownload($id: ID!, $resolution: String) {
    enableMuxDownload(id: $id, resolution: $resolution) {
      id
    }
  }
`)

export default function AddVideoVariantDownloadDialog({
  params: { videoId, variantId, downloadId: languageId }
}: AddVideoVariantDownloadDialogProps): ReactElement {
  const router = useRouter()
  const [createVideoVariantDownload] = useMutation(
    VIDEO_VARIANT_DOWNLOAD_CREATE
  )
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [createR2Asset] = useCreateR2AssetMutation()
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [enableMuxDownload] = useMutation(ENABLE_MUX_DOWNLOAD)

  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANT, {
    variables: { id: variantId }
  })

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

  const initialValues: FormikValues = {
    quality: 'auto',
    file: null
  }

  const existingQualities = data.videoVariant.downloads.map(
    (download) => download.quality
  )

  const validationSchema = object({
    quality: string()
      .required('Quality is required')
      .test(
        'unique-quality',
        'A download with this quality already exists',
        (value) => {
          // For auto option, which creates both high and low
          if (value === 'auto') {
            // Only disallow if both high and low already exist
            const hasHigh = existingQualities.includes('high')
            const hasLow = existingQualities.includes('low')
            const hasSd = existingQualities.includes('sd')
            return !(hasHigh && hasLow && hasSd)
          }

          // For direct upload options
          return !existingQualities.includes(value as 'high' | 'low' | 'sd')
        }
      ),
    // Accept any value for file for generate options
    file: string().when('quality', {
      is: (val: string) => val !== 'auto',
      then: (schema) => schema.required('File is required'),
      otherwise: (schema) => schema.nullable().optional()
    })
  })

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    setIsLoading(true)

    // Handle auto generation from Mux
    if (values.quality === 'auto') {
      if (
        data.videoVariant.muxVideo?.id != null &&
        data.videoVariant.muxVideo?.playbackId != null
      ) {
        try {
          await enableMuxDownload({
            variables: {
              id: data.videoVariant.muxVideo.id,
              resolution: '720p'
            }
          })
          await enableMuxDownload({
            variables: {
              id: data.videoVariant.muxVideo.id,
              resolution: '360p'
            }
          })
          await enableMuxDownload({
            variables: {
              id: data.videoVariant.muxVideo.id,
              resolution: '270p'
            }
          })
          await createVideoVariantDownload({
            variables: {
              input: {
                videoVariantId: variantId,
                quality: 'high',
                size: 0,
                height: 720,
                width: 1280,
                url: `https://stream.mux.com/${data.videoVariant.muxVideo.playbackId}/720p.mp4`,
                version: 0,
                assetId: null
              }
            }
          })
          await createVideoVariantDownload({
            variables: {
              input: {
                videoVariantId: variantId,
                quality: 'sd',
                size: 0,
                height: 360,
                width: 640,
                url: `https://stream.mux.com/${data.videoVariant.muxVideo.playbackId}/360p.mp4`,
                version: 0,
                assetId: null
              }
            }
          })
          await createVideoVariantDownload({
            variables: {
              input: {
                videoVariantId: variantId,
                quality: 'low',
                size: 0,
                height: 270,
                width: 480,
                url: `https://stream.mux.com/${data.videoVariant.muxVideo.playbackId}/270p.mp4`,
                version: 0,
                assetId: null
              }
            }
          })
          enqueueSnackbar(
            'Downloads created. The download sizes will be automatically updated when they become available.',
            { variant: 'success' }
          )

          router.push(returnUrl, { scroll: false })
        } catch (error) {
          enqueueSnackbar(
            error.message ?? 'Failed to create downloads from Mux',
            {
              variant: 'error'
            }
          )
        }
      } else {
        enqueueSnackbar('Mux asset unavailable', { variant: 'error' })
      }
      setIsLoading(false)
      return
    }

    // Handle regular file upload
    if (uploadedFile == null || videoDimensions == null || videoId == null) {
      enqueueSnackbar('Please upload a valid video file', { variant: 'error' })
      setIsLoading(false)
      return
    }

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

  const isGenerateOption = (quality: string): boolean => {
    return quality === 'auto'
  }

  const getButtonText = (quality: string): string => {
    return isGenerateOption(quality) ? 'Generate' : 'Add'
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({
        errors,
        touched,
        setFieldValue,
        handleChange,
        values,
        submitForm,
        isSubmitting,
        validateForm
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
            onSubmit: async () => {
              // For auto and generate options, manually validate to bypass file validation
              if (isGenerateOption(values.quality)) {
                const errors = await validateForm()

                // If there are no errors or only file errors when using generate options
                if (
                  Object.keys(errors).length === 0 ||
                  (Object.keys(errors).length === 1 && errors.file)
                ) {
                  void submitForm()
                }
              } else {
                void submitForm()
              }
            },
            submitLabel: getButtonText(values.quality),
            closeLabel: 'Cancel'
          }}
          loading={isLoading || isSubmitting}
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
                  <MenuItem
                    value="auto"
                    disabled={!data.videoVariant.muxVideo?.playbackId}
                  >
                    Auto generate from Mux{' '}
                    {!data.videoVariant.muxVideo?.playbackId
                      ? ' (Mux asset unavailable)'
                      : ''}
                  </MenuItem>
                  <MenuItem value="high">Upload high 720p (2500kbps)</MenuItem>
                  <MenuItem value="sd">Upload SD 360p (1000kbps)</MenuItem>
                  <MenuItem value="low">Upload low 270p (500kbps)</MenuItem>
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
                  {values.quality === 'auto' && (
                    <Typography variant="body2" color="text.secondary">
                      This will generate high (720p), SD (360p) and low (270p)
                      quality downloads from Mux.
                    </Typography>
                  )}
                </>
              )}
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}

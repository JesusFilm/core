'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { object, string } from 'yup'

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

  const { data } = useSuspenseQuery(GET_ADMIN_VIDEO_VARIANT, {
    variables: { id: variantId }
  })

  const returnUrl = `/videos/${videoId}/audio/${variantId}/downloads`
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
        (value) => !existingQualities.includes(value as 'high' | 'low')
      ),
    file: string().required('File is required')
  })

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (uploadedFile == null || videoDimensions == null || videoId == null)
      return
    const extension = getExtension(values.file.name)
    const r2Asset = await createR2Asset({
      variables: {
        input: {
          videoId: videoId,
          fileName: `${videoId}/variants/${languageId}/downloads/${variantId}_${values.quality}${extension}`,
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
            videoVariantId: variantId,
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
          router.push(returnUrl)
        }
      })
    }
    router.push(returnUrl)
  }

  return (
    <Dialog
      open={true}
      onClose={() => router.push(returnUrl)}
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
                    <MenuItem value="high">high</MenuItem>
                    <MenuItem value="low">low</MenuItem>
                  </Select>
                  <FormHelperText sx={{ minHeight: 20 }}>
                    {errors.quality != null &&
                      typeof errors.quality === 'string' &&
                      errors.quality}
                  </FormHelperText>
                </FormControl>

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
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => router.push(returnUrl)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

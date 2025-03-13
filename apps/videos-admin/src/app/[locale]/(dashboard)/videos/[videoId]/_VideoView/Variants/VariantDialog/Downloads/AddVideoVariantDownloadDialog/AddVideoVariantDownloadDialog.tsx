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
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { object, string } from 'yup'

import { LinkFile } from '../../../../../../../../../../components/LinkFile'
import { useCreateR2AssetMutation } from '../../../../../../../../../../libs/useCreateR2Asset'
import { useVideoVariantDownloadCreateMutation } from '../../../../../../../../../../libs/useVideoVariantDownloadCreateMutation'
import { FileUpload } from '../../../../Metadata/VideoImage/FileUpload'
import { getExtension } from '../../../AddAudioLanguageDialog/utils/getExtension'

interface AddVideoVariantDownloadDialogProps {
  open: boolean
  handleClose?: () => void
  onSuccess?: () => void
  videoVariantId: string
  existingQualities: string[]
}

export function AddVideoVariantDownloadDialog({
  open,
  handleClose,
  onSuccess,
  videoVariantId,
  existingQualities
}: AddVideoVariantDownloadDialogProps): ReactElement {
  const params = useParams<{ videoId: string; locale: string }>()
  const videoId = params?.videoId
  const t = useTranslations()
  const [createVideoVariantDownload] = useVideoVariantDownloadCreateMutation()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [createR2Asset] = useCreateR2AssetMutation()
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const handleUpload = async (file: File): Promise<void> => {
    if (!file) return
    const video = document.createElement('video')
    function cleanup() {
      URL.revokeObjectURL(video.src)
      video.remove()
    }
    video.onerror = function () {
      cleanup()
      enqueueSnackbar(t('Failed to load video'), {
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
      .required(t('Quality is required'))
      .test(
        'unique-quality',
        t('A download with this quality already exists'),
        (value) => !existingQualities.includes(value)
      ),
    file: string().required(t('File is required'))
  })

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (uploadedFile == null || videoDimensions == null || videoId == null)
      return
    const extension = getExtension(values.file.name)
    const r2Asset = await createR2Asset({
      variables: {
        input: {
          videoId: videoId,
          fileName: `${videoId}/variants/${videoVariantId}/downloads/${videoVariantId}_${values.quality}.${extension}`,
          contentType: uploadedFile.type,
          contentLength: uploadedFile.size
        }
      }
    })
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
          enqueueSnackbar(t('Failed to create download'), {
            variant: 'error'
          })
        },
        onCompleted: () => {
          enqueueSnackbar(t('Download created'), {
            variant: 'success'
          })
          onSuccess?.()
        }
      })
    }
    handleClose?.()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="add-download-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="add-download-dialog-title">
        {t('Add Download')}
      </DialogTitle>
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
                  <InputLabel id="quality-label">{t('Quality')}</InputLabel>
                  <Select
                    name="quality"
                    value={values.quality}
                    labelId="quality-label"
                    label={t('Quality')}
                    error={touched.quality && Boolean(errors.quality)}
                    onChange={handleChange}
                  >
                    <MenuItem value="high">{t('high')}</MenuItem>
                    <MenuItem value="low">{t('low')}</MenuItem>
                  </Select>
                  <FormHelperText sx={{ minHeight: 20 }}>
                    {errors.quality != null &&
                      typeof errors.quality === 'string' &&
                      errors.quality}
                  </FormHelperText>
                </FormControl>
                <FileUpload
                  accept={{
                    'video/*': []
                  }}
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
              <Button onClick={handleClose}>{t('Cancel')}</Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>
                {t('Save')}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

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
import TextField from '@mui/material/TextField'
import { Field, Form, Formik, FormikValues } from 'formik'
import { useTranslations } from 'next-intl'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { number, object, string } from 'yup'

import { useVideoVariantDownloadCreateMutation } from '../../../../../../../../../../libs/useVideoVariantDownloadCreateMutation'

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
  const t = useTranslations()
  const [createVideoVariantDownload] = useVideoVariantDownloadCreateMutation()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

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

  const handleUpload = (file: File): void => {
    // This is a stub for file upload functionality
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

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (uploadedFile == null || videoDimensions == null) return
    const publicUrl = null
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
            version: 0
          }
        },
        onError: () => {
          enqueueSnackbar(t('Failed to create download'), {
            variant: 'error'
          })
        }
      })
    }
    onSuccess?.()
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
          values
        }) => (
          <Form onSubmit={handleSubmit}>
            <DialogContent>
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

              {/* to do: replace with FileUpload component when subtitles is in. */}
              <TextField
                name="file"
                value={values.file}
                fullWidth
                margin="normal"
                type="file"
                slotProps={{
                  htmlInput: {
                    accept: 'video/*',
                    'aria-label': t('Upload File')
                  }
                }}
                onChange={async (event) => {
                  const file = (event.target as HTMLInputElement).files?.[0]
                  if (file) {
                    await handleUpload(file)
                    await setFieldValue('file', file)
                  }
                }}
              />
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

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
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
    height: '',
    width: '',
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
    height: number()
      .required(t('Height is required'))
      .positive(t('Height must be positive'))
      .integer(t('Height must be an integer')),
    width: number()
      .required(t('Width is required'))
      .positive(t('Width must be positive'))
      .integer(t('Width must be an integer')),
    url: string().required(t('URL is required'))
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
        {({ errors, touched, isSubmitting, setFieldValue, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <DialogContent>
              <FormControl
                fullWidth
                margin="normal"
                error={touched.quality && Boolean(errors.quality)}
              >
                <InputLabel id="quality-label">{t('Quality')}</InputLabel>
                <Field
                  as={Select}
                  name="quality"
                  labelId="quality-label"
                  label={t('Quality')}
                  helperText={errors.quality}
                >
                  <MenuItem value="high">{t('high')}</MenuItem>
                  <MenuItem value="low">{t('low')}</MenuItem>
                </Field>
              </FormControl>
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="height"
                label={t('Height')}
                type="number"
                error={touched.height && Boolean(errors.height)}
                helperText={touched.height && errors.height}
              />
              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="width"
                label={t('Width')}
                type="number"
                error={touched.width && Boolean(errors.width)}
                helperText={touched.width && errors.width}
              />

              {/* to do: replace with FileUpload component when subtitles is in. */}
              <TextField
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

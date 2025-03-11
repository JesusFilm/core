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
import { Field, Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'
import { number, object, string } from 'yup'

import { useVideoVariantDownloadCreateMutation } from '../../../../../../../../../../libs/useVideoVariantDownloadCreateMutation'

interface AddVideoVariantDownloadDialogProps {
  open: boolean
  handleClose: () => void
  onSuccess: () => void
  videoVariantId: string
  existingQualities: string[]
}

interface FormValues {
  quality: 'high' | 'low'
  size: number | ''
  height: number | ''
  width: number | ''
  url: string
  version: number | ''
  file?: File | null
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

  const initialValues: FormValues = {
    quality: 'high',
    size: '',
    height: '',
    width: '',
    url: '',
    version: '',
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
    size: number()
      .required(t('Size is required'))
      .positive(t('Size must be positive')),
    height: number()
      .required(t('Height is required'))
      .positive(t('Height must be positive'))
      .integer(t('Height must be an integer')),
    width: number()
      .required(t('Width is required'))
      .positive(t('Width must be positive'))
      .integer(t('Width must be an integer')),
    url: string().required(t('URL is required')),
    version: number()
      .required(t('Version is required'))
      .positive(t('Version must be positive'))
      .integer(t('Version must be an integer'))
  })

  const handleUpload = (file: File): void => {
    // This is a stub for file upload functionality
    setUploadedFile(file)
    return
  }

  const handleSubmit = async (values: FormValues): Promise<void> => {
    await createVideoVariantDownload({
      variables: {
        input: {
          videoVariantId,
          quality: values.quality,
          size: values.size as number,
          height: values.height as number,
          width: values.width as number,
          url: values.url,
          version: values.version as number
        }
      }
    })
    onSuccess()
    handleClose()
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
        {({ errors, touched, isSubmitting, setFieldValue }) => (
          <Form>
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
                >
                  <MenuItem value="high">{t('high')}</MenuItem>
                  <MenuItem value="low">{t('low')}</MenuItem>
                </Field>
                {touched.quality && errors.quality && (
                  <FormHelperText>{errors.quality}</FormHelperText>
                )}
              </FormControl>

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="size"
                label={t('Size (MB)')}
                type="number"
                inputProps={{ step: 'any' }}
                error={touched.size && Boolean(errors.size)}
                helperText={touched.size && errors.size}
              />

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

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="url"
                label={t('URL')}
                error={touched.url && Boolean(errors.url)}
                helperText={touched.url && errors.url}
              />

              <Field
                as={TextField}
                fullWidth
                margin="normal"
                name="version"
                label={t('Version')}
                type="number"
                error={touched.version && Boolean(errors.version)}
                helperText={touched.version && errors.version}
              />

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

import { ReactElement, useEffect } from 'react'
import useDownloader from 'react-use-downloader'
import { Formik, Form } from 'formik'
import LoadingButton from '@mui/lab/LoadingButton'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import { Dialog } from '@core/shared/ui/Dialog'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'

import { VideoContentFields_variant_downloads as Downloads } from '../../../__generated__/VideoContentFields'
// import { VideoVariantDownloadQuality } from '../../../__generated__/globalTypes'

interface DownloadDialogProps {
  downloads: Downloads[]
  open?: boolean
  title: string
  onClose: () => void
}

function formatBytes(bytes, decimals = 2): string {
  if ((bytes ?? 0) <= 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function DownloadDialog({
  open = false,
  downloads,
  title,
  onClose
}: DownloadDialogProps): ReactElement {
  const { size, percentage, download, cancel, error, isInProgress } =
    useDownloader()

  useEffect(() => {
    if (percentage === 100) {
      onClose()
    }
  }, [percentage, onClose])

  console.log('download', percentage, downloads)

  const initialValues = {
    file: downloads[0].url,
    terms: false
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        cancel()
        onClose()
      }}
      dialogTitle={{
        title: 'Download Video',
        closeButton: true
      }}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={(values) => {
          void download(values.file, `${title}.mp4`)
        }}
      >
        {({ values, errors, handleChange, handleBlur }) => (
          <Form>
            <TextField
              name="file"
              label="Select a file size"
              fullWidth
              value={values.file}
              onChange={handleChange}
              onBlur={handleBlur}
              helperText={errors.file}
              error={errors.file != null}
              select
            >
              {downloads.map((download) => (
                <MenuItem key={download.quality} value={download.url}>
                  {download.quality} ({formatBytes(download.size)})
                </MenuItem>
              ))}
            </TextField>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ my: 4 }}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="terms"
                      defaultChecked
                      checked={values.terms}
                      onChange={handleChange}
                    />
                  }
                  label="I agree to the Terms of Use"
                />
              </FormGroup>
              <LoadingButton
                type="submit"
                variant="contained"
                size="small"
                disabled={!values.terms}
                startIcon={<ArrowDownwardIcon />}
                sx={{
                  pr: '64px'
                }}
                loading={isInProgress}
                loadingPosition="end"
                loadingIndicator={
                  <CircularProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ color: 'primary.contrastText' }}
                  />
                }
              >
                Download
              </LoadingButton>
            </Stack>
            <LinearProgress variant="determinate" value={percentage} />
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}

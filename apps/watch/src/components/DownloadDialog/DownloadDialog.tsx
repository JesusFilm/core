import { ComponentProps, ReactElement, useEffect } from 'react'
import useDownloader from 'react-use-downloader'
import { Formik, Form } from 'formik'
import Image from 'next/image'
import Box from '@mui/material/Box'
import LoadingButton from '@mui/lab/LoadingButton'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import LanguageIcon from '@mui/icons-material/Language'
import { useTheme } from '@mui/material/styles'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import { Dialog } from '@core/shared/ui/Dialog'

import { useVideo } from '../../libs/videoContext'

interface DownloadDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

function formatBytes(bytes, decimals = 2): string {
  if ((bytes ?? 0) <= 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function DownloadDialog({
  open,
  onClose
}: DownloadDialogProps): ReactElement {
  const theme = useTheme()
  const { title, image, imageAlt, variant } = useVideo()
  const { percentage, download, cancel, isInProgress } = useDownloader()

  const downloads = variant?.downloads ?? []
  const language = variant?.language ?? {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'Translation', value: 'English' }]
  }
  const time = secondsToTimeFormat(variant?.duration ?? 0)

  useEffect(() => {
    if (percentage === 100) {
      onClose()
    }
  }, [percentage, onClose])

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
      <>
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={4}
          alignItems="flex-start"
          sx={{ mt: { xs: 0, sm: 1 }, mb: { xs: 0, sm: 5 } }}
        >
          {image != null && (
            <>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  justifyContent: 'end',
                  alignItems: 'end'
                }}
              >
                <Image
                  src={image}
                  alt={imageAlt[0].value}
                  width={240}
                  height={115}
                  objectFit="cover"
                  style={{ borderRadius: theme.spacing(2) }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{
                    position: 'absolute',
                    color: 'primary.contrastText',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '5px 9px',
                    borderRadius: 2,
                    m: 1
                  }}
                >
                  <PlayArrowRoundedIcon />
                  <Typography>{`${time.split(':')[0]}${time.slice(
                    2
                  )}`}</Typography>
                </Stack>
              </Box>
            </>
          )}
          <Stack>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {title[0].value}
            </Typography>
            <Stack direction="row" alignItems="center">
              <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body1">{language.name[0].value}</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => {
            void download(values.file, `${title[0].value}.mp4`)
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
                    {download.quality.charAt(0).toUpperCase()}
                    {download.quality.slice(1)} ({formatBytes(download.size)})
                  </MenuItem>
                ))}
              </TextField>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={3}
                sx={{ mt: 6 }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="terms"
                        disabled={isInProgress}
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
                  loading={isInProgress}
                  loadingPosition="start"
                  loadingIndicator={
                    <CircularProgress
                      variant="determinate"
                      value={Math.max(10, percentage)}
                      sx={{ color: 'action.disabled', ml: 1 }}
                      // Mui has style that overrides sx. Use style
                      style={{ width: '20px', height: '20px' }}
                    />
                  }
                >
                  Download
                </LoadingButton>
              </Stack>
            </Form>
          )}
        </Formik>
      </>
    </Dialog>
  )
}

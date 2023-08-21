import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import LanguageIcon from '@mui/icons-material/Language'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import Image from 'next/legacy/image'
import { ComponentProps, ReactElement, useEffect, useState } from 'react'
import useDownloader from 'react-use-downloader'

import { Dialog } from '@core/shared/ui/Dialog'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { useVideo } from '../../libs/videoContext'

import { TermsOfUseDialog } from './TermsOfUseDialog'

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
  const [openTerms, setOpenTerms] = useState<boolean>(false)

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
          {({ values, errors, handleChange, handleBlur, setFieldValue }) => (
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
                <FormGroup sx={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FormControlLabel
                    sx={{ marginRight: '4px' }}
                    control={
                      <Checkbox
                        name="terms"
                        disabled={isInProgress}
                        checked={values.terms}
                        onChange={handleChange}
                      />
                    }
                    label="I agree to the"
                  />
                  <Link
                    underline="none"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setOpenTerms(true)}
                  >
                    Terms of Use
                  </Link>
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
              <TermsOfUseDialog
                open={openTerms}
                onClose={() => {
                  setFieldValue('terms', false)
                  setOpenTerms(false)
                }}
                onSubmit={() => {
                  setFieldValue('terms', true)
                  setOpenTerms(false)
                }}
              />
            </Form>
          )}
        </Formik>
      </>
    </Dialog>
  )
}

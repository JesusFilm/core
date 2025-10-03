import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import LanguageIcon from '@mui/icons-material/Language'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
import last from 'lodash/last'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useEffect, useState } from 'react'
import useDownloader from 'react-use-downloader'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { VideoVariantDownloadQuality } from '../../../__generated__/globalTypes'
import { useVideo } from '../../libs/videoContext'

import { TermsOfUseDialog } from './TermsOfUseDialog'

interface DownloadDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

function formatBytes(bytes: number, decimals = 2): string {
  if ((bytes ?? 0) <= 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
    sizes[i]
  }`
}

export function DownloadDialog({
  open,
  onClose
}: DownloadDialogProps): ReactElement {
  const theme = useTheme()
  const { title, images, imageAlt, variant } = useVideo()
  const { percentage, download, cancel, isInProgress } = useDownloader()
  const [openTerms, setOpenTerms] = useState<boolean>(false)
  const { t } = useTranslation('apps-watch')
  const downloads = variant?.downloads ?? []
  const language = variant?.language ?? {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'LanguageName', value: 'English' }]
  }
  const time = secondsToTimeFormat(variant?.duration ?? 0)

  useEffect(() => {
    if (percentage === 100) {
      onClose?.()
    }
  }, [percentage, onClose])

  const validationSchema = object().shape({
    file: string().test('no-downloads', t('No Downloads Available'), (file) => {
      if (file == null || file === '') {
        // fail validation
        return false
      } else {
        // pass validation
        return true
      }
    })
  })

  const qualityEnumToOrder = {
    [VideoVariantDownloadQuality.highest]: 0,
    [VideoVariantDownloadQuality.high]: 1,
    [VideoVariantDownloadQuality.low]: 2
  }

  function getQualityLabel(quality: keyof typeof qualityEnumToOrder): string {
    switch (quality) {
      case VideoVariantDownloadQuality.highest:
        return t('Highest')
      case VideoVariantDownloadQuality.high:
        return t('High')
      case VideoVariantDownloadQuality.low:
        return t('Low')
    }
  }

  function getDownloadUrl(file: string): string {
    const url = new URL(file)
    url.searchParams.set('download', `${title[0].value}.mp4`)
    return url.toString()
  }

  type Download = (typeof downloads)[number] & {
    quality: keyof typeof qualityEnumToOrder
  }

  const filteredDownloads = downloads.filter(({ quality }) =>
    Object.keys(qualityEnumToOrder).includes(quality)
  ) as Download[]

  const initialValues = {
    file: filteredDownloads[0]?.url ?? '',
    terms: false
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        cancel()
        onClose?.()
      }}
      dialogTitle={{
        title: t('Download Video'),
        closeButton: true
      }}
      testId="DownloadDialog"
    >
      <>
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={4}
          alignItems="flex-start"
          sx={{ mt: { xs: 0, sm: 1 }, mb: { xs: 0, sm: 5 } }}
        >
          {images[0]?.mobileCinematicHigh != null && (
            <>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  justifyContent: 'end',
                  alignItems: 'end'
                }}
              >
                <Image
                  src={images[0].mobileCinematicHigh}
                  alt={imageAlt[0].value}
                  width={240}
                  height={115}
                  style={{
                    borderRadius: theme.spacing(2),
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'cover'
                  }}
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
              {last(title)?.value}
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
          validationSchema={validationSchema}
          validateOnMount
        >
          {({ values, errors, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <TextField
                name="file"
                label={t('Select a file size')}
                fullWidth
                value={values.file}
                onChange={handleChange}
                onBlur={handleBlur}
                helperText={errors.file}
                error={errors.file != null}
                disabled={values.file === ''}
                select
              >
                {filteredDownloads
                  .sort((a, b) => {
                    return (
                      qualityEnumToOrder[a.quality] -
                      qualityEnumToOrder[b.quality]
                    )
                  })
                  .map((download) => (
                    <MenuItem key={download.quality} value={download.url}>
                      {getQualityLabel(download.quality)} (
                      {formatBytes(download.size)})
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
                    label={t('I agree to the')}
                  />
                  <Link
                    underline="none"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setOpenTerms(true)}
                  >
                    {t('Terms of Use')}
                  </Link>
                </FormGroup>
                {values.terms === true &&
                values.file?.startsWith('https://stream.mux.com/') ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ArrowDownwardIcon />}
                    onClick={() => {
                      onClose?.()
                    }}
                    href={getDownloadUrl(values.file)}
                  >
                    {t('Download')}
                  </Button>
                ) : (
                  <Button
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
                    {t('Download')}
                  </Button>
                )}
              </Stack>
              <TermsOfUseDialog
                open={openTerms}
                onClose={async () => {
                  await setFieldValue('terms', false)
                  setOpenTerms(false)
                }}
                onSubmit={async () => {
                  await setFieldValue('terms', true)
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

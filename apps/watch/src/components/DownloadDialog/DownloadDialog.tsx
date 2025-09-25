import { useLazyQuery } from '@apollo/client'
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
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
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

import { ResultOf, VariablesOf } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { VideoVariantDownloadQuality } from '../../../__generated__/globalTypes'
import { useVideo } from '../../libs/videoContext'
import { GET_SUBTITLES } from '../../libs/watchContext/useSubtitleUpdate/useSubtitleUpdate'

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

function getSubtitleExtension(fileUrl: string): string {
  const fallback = 'vtt'
  if (fileUrl == null || fileUrl === '') return fallback

  const extractFromPath = (value: string): string => {
    const fileName = value.split('?')[0]?.split('/').pop() ?? ''
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension ?? ''
  }

  try {
    const url = new URL(fileUrl)
    const extension = extractFromPath(url.pathname)
    if (extension !== '') return extension
  } catch {
    const extension = extractFromPath(fileUrl)
    if (extension !== '') return extension
  }

  return fallback
}

function createSubtitleFileName(
  title: string,
  languageName: string,
  extension: string
): string {
  const base = `${title}-${languageName}`.trim()
  const normalized = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const safeBase = normalized.length > 0 ? normalized : 'subtitle'

  return `${safeBase}.${extension}`
}

export function DownloadDialog({
  open,
  onClose
}: DownloadDialogProps): ReactElement {
  const theme = useTheme()
  const { title, images, imageAlt, variant } = useVideo()
  const { percentage, download, cancel, isInProgress } = useDownloader()
  const [openTerms, setOpenTerms] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'video' | 'subtitles'>('video')
  const { t } = useTranslation('apps-watch')
  const [
    loadSubtitles,
    {
      data: subtitlesData,
      loading: subtitlesLoading,
      variables: subtitleVariables,
      called: subtitlesCalled
    }
  ] = useLazyQuery<
    ResultOf<typeof GET_SUBTITLES>,
    VariablesOf<typeof GET_SUBTITLES>
  >(GET_SUBTITLES)
  const downloads = variant?.downloads ?? []
  const language = variant?.language ?? {
    __typename: 'Language',
    id: '529',
    name: [{ __typename: 'LanguageName', value: 'English' }]
  }
  const subtitleCount = variant?.subtitleCount ?? 0
  const videoTitle = last(title)?.value ?? 'video'
  const subtitles = subtitlesData?.video?.variant?.subtitle ?? []
  const subtitleDownloads = subtitles.filter(
    (subtitle) => subtitle?.value != null && subtitle.value !== ''
  )
  const subtitleVariablesId = subtitleVariables?.id
  const time = secondsToTimeFormat(variant?.duration ?? 0)
  const subtitleTabLabel =
    subtitleCount > 0
      ? t('SubtitlesWithCount', { count: subtitleCount })
      : t('Subtitles')

  useEffect(() => {
    if (percentage === 100) {
      onClose?.()
    }
  }, [percentage, onClose])

  useEffect(() => {
    if (open) {
      setActiveTab('video')
    }
  }, [open])

  useEffect(() => {
    if (
      activeTab === 'subtitles' &&
      subtitleCount > 0 &&
      variant?.slug != null &&
      (subtitleVariablesId !== variant.slug || !subtitlesCalled)
    ) {
      void loadSubtitles({ variables: { id: variant.slug } })
    }
  }, [
    activeTab,
    subtitleCount,
    variant?.slug,
    loadSubtitles,
    subtitleVariablesId,
    subtitlesCalled
  ])

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
    url.searchParams.set('download', `${videoTitle}.mp4`)
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
        <Tabs
          value={activeTab}
          onChange={(_, value) =>
            setActiveTab(value as 'video' | 'subtitles')
          }
          aria-label={t('Download Options')}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label={t('VideoFilesTab')} value="video" />
          <Tab label={subtitleTabLabel} value="subtitles" />
        </Tabs>
        {activeTab === 'video' ? (
          <Formik
            initialValues={initialValues}
            onSubmit={(values) => {
              void download(values.file, `${videoTitle}.mp4`)
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
        ) : (
          <Stack spacing={3} sx={{ mt: 4 }}>
            {subtitleCount === 0 ? (
              <Typography variant="body2">
                {t('No Subtitles Available')}
              </Typography>
            ) : subtitlesLoading ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2">
                  {t('Loading Subtitles')}
                </Typography>
              </Stack>
            ) : subtitleDownloads.length > 0 ? (
              subtitleDownloads.map((subtitle) => {
                const languageName =
                  subtitle.language.name[0]?.value ??
                  t('UnknownSubtitleLanguage')
                const extension = getSubtitleExtension(subtitle.value)
                return (
                  <Stack
                    key={subtitle.language.id ?? subtitle.value}
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    spacing={2}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">{languageName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('SubtitleFileDescription', {
                          extension: extension.toUpperCase()
                        })}
                      </Typography>
                    </Stack>
                    <Button
                      component="a"
                      href={subtitle.value}
                      download={createSubtitleFileName(
                        videoTitle,
                        languageName,
                        extension
                      )}
                      variant="contained"
                      size="small"
                      startIcon={<ArrowDownwardIcon />}
                    >
                      {t('Download')}
                    </Button>
                  </Stack>
                )
              })
            ) : (
              <Typography variant="body2">
                {t('SubtitleDownloadsUnavailable')}
              </Typography>
            )}
            <Stack spacing={1}>
              <Typography variant="subtitle1">
                {t('SubtitleInstructionsHeading')}
              </Typography>
              <Box component="ol" sx={{ pl: 3, mt: 1 }}>
                <Typography component="li" variant="body2">
                  {t('SubtitleInstructionDownload')}
                </Typography>
                <Typography component="li" variant="body2">
                  {t('SubtitleInstructionSameFolder')}
                </Typography>
                <Typography component="li" variant="body2">
                  {t('SubtitleInstructionLoadInPlayer')}
                </Typography>
                <Typography component="li" variant="body2">
                  {t('SubtitleInstructionManual')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {t('SubtitleInstructionsTip')}
              </Typography>
            </Stack>
          </Stack>
        )}
      </>
    </Dialog>
  )
}

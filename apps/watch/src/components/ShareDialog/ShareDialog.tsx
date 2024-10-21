import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ComponentProps, ReactElement, SyntheticEvent, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import FacebookLogo from '@core/shared/ui/icons/FacebookLogo'
import TwitterLogo from '@core/shared/ui/icons/TwitterLogo'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { useVideo } from '../../libs/videoContext'

interface ShareDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

export function ShareDialog({
  ...dialogProps
}: ShareDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { description, snippet, images, title, variant } = useVideo()
  const [value, setValue] = useState(0)
  const theme = useTheme()
  const router = useRouter()

  const { t } = useTranslation('apps-watch')

  const handleChange = (e: SyntheticEvent, newValue: number): void => {
    setValue(newValue)
  }

  const shareDescription =
    description != null && description.length > 0
      ? description[0].value
      : snippet != null && snippet.length > 0
        ? snippet[0].value
        : ''

  const shareLink =
    router?.query != null
      ? `${
          process.env.NEXT_PUBLIC_WATCH_URL ??
          'https://watch-jesusfilm.vercel.app'
        }/${Object.values(router?.query).join('/')}`.trim()
      : ''

  const handleShareLinkClick = async (): Promise<void> => {
    await navigator.clipboard.writeText(shareLink)
    enqueueSnackbar('Link Copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  const getEmbedCode = (): string =>
    `<div class="arc-cont"><iframe src="https://api.arclight.org/videoPlayerUrl?refId=${
      variant != null ? variant.id : ''
    }&playerStyle=default" allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe><style>.arc-cont{position:relative;display:block;margin:10px auto;width:100%}.arc-cont:after{padding-top:59%;display:block;content:""}.arc-cont>iframe{position:absolute;top:0;bottom:0;right:0;left:0;width:98%;height:98%;border:0}</style></div>`

  const handleEmbedCodeClick = async (): Promise<void> => {
    await navigator.clipboard.writeText(getEmbedCode())
    enqueueSnackbar('Code Copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  const ShareLink = (): ReactElement => (
    <Stack>
      <TextField
        fullWidth
        id="shareLink"
        defaultValue={shareLink}
        variant="outlined"
        InputProps={{
          readOnly: true
        }}
        sx={{ mb: 4 }}
      />
      <Button
        variant="contained"
        size="small"
        startIcon={<ContentCopyIcon />}
        onClick={handleShareLinkClick}
        sx={{ alignSelf: 'flex-end' }}
      >
        {t('Copy Link')}
      </Button>
    </Stack>
  )

  return (
    <Dialog
      {...dialogProps}
      dialogTitle={{
        title: 'Share this video',
        closeButton: true
      }}
      divider
      testId="ShareDialog"
    >
      <>
        <Stack
          direction="row"
          spacing={4}
          alignItems="flex-start"
          sx={{ mb: 4 }}
        >
          {images[0]?.mobileCinematicHigh != null && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Image
                src={images[0].mobileCinematicHigh}
                alt={title[0].value}
                width={240}
                height={115}
                style={{
                  borderRadius: theme.spacing(2),
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'cover'
                }}
              />
            </Box>
          )}
          <Stack sx={{ maxWidth: { sm: '272px' } }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {title[0].value}
            </Typography>
            <Typography>
              {`${shareDescription.split(' ').slice(0, 18).join(' ')}...`}
            </Typography>
          </Stack>
        </Stack>
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <IconButton
              aria-label="Share to Facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`}
              target="_blank"
              rel="noopener"
            >
              <FacebookLogo sx={{ fontSize: 46 }} />
            </IconButton>
            <IconButton
              aria-label="Share to Twitter"
              href={`https://twitter.com/intent/tweet?url=${shareLink}`}
              target="_blank"
              rel="noopener"
            >
              <TwitterLogo sx={{ fontSize: 46 }} />
            </IconButton>
          </Stack>
          {variant?.hls === null || variant === null ? (
            <ShareLink />
          ) : (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="fullWidth"
                  aria-label="share and embed"
                >
                  <Tab label="Share Link" {...tabA11yProps('share', 0)} />
                  <Tab label="Embed Code" {...tabA11yProps('embed', 1)} />
                </Tabs>
              </Box>
              <TabPanel name="share" value={value} index={0} sx={{ mt: 4 }}>
                <ShareLink />
              </TabPanel>
              <TabPanel name="embed" value={value} index={1} sx={{ mt: 4 }}>
                <Stack>
                  <TextField
                    fullWidth
                    multiline
                    id="embedCode"
                    defaultValue={getEmbedCode()}
                    variant="outlined"
                    InputProps={{
                      readOnly: true
                    }}
                    sx={{ mb: 4 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleEmbedCodeClick}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    {t('Copy Code')}
                  </Button>
                </Stack>
              </TabPanel>
            </>
          )}
        </>
      </>
    </Dialog>
  )
}

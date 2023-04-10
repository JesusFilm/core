import { ReactElement, useState, SyntheticEvent, ComponentProps } from 'react'
import { useSnackbar } from 'notistack'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { createSvgIcon } from '@mui/material/utils'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { useVideo } from '../../libs/videoContext'

interface ShareDialogProps
  extends Pick<ComponentProps<typeof Dialog>, 'open' | 'onClose'> {}

export function ShareDialog({
  ...dialogProps
}: ShareDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { description, snippet, image, title, variant } = useVideo()
  const [value, setValue] = useState(0)
  const theme = useTheme()
  const router = useRouter()

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

  // COOLDOWN TODO: Make reusable SocialIcons
  const FacebookIcon = createSvgIcon(
    <>
      <defs>
        <linearGradient id="fbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#18ACFE', stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: '#0163E0', stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#fbGrad)" />
      <path
        d="M 15.9103 15.2112 L 16.3767 12.2476 H 13.4589 V 10.3253 C 13.4589 9.5143 13.8658 8.7233 15.1727 8.7233 H 16.5 V 6.2002 C 16.5 6.2002 15.2959 6 14.1452 6 C 11.7411 6 10.1713 7.4197 10.1713 9.9888 V 12.2476 H 7.5 V 15.2112 H 10.1713 V 22.3759 C 10.7075 22.458 11.2561 22.5 11.815 22.5 C 12.374 22.5 12.9227 22.458 13.4589 22.3759 V 15.2112 H 15.9103 Z"
        fill="white"
      />
    </>,
    'FacebookIcon'
  )

  const TwitterIcon = createSvgIcon(
    <path
      d="M 8.8415 21 C 6.4153 21 4.1536 20.2943 2.25 19.0767 C 3.8662 19.1813 6.7186 18.9308 8.4927 17.2386 C 5.8238 17.1161 4.6202 15.0692 4.4632 14.1945 C 4.69 14.282 5.7715 14.387 6.382 14.142 C 3.3119 13.3722 2.8409 10.678 2.9456 9.8558 C 3.5213 10.2581 4.4981 10.3981 4.8818 10.363 C 2.0211 8.3162 3.0503 5.2371 3.5561 4.5723 C 5.6091 7.4165 8.6859 9.0139 12.4923 9.1028 C 12.4205 8.7881 12.3827 8.4603 12.3827 8.1237 C 12.3827 5.7082 14.335 3.75 16.7435 3.75 C 18.0019 3.75 19.1358 4.2846 19.9318 5.1396 C 20.7727 4.9426 22.0382 4.4813 22.6569 4.0824 C 22.3451 5.2021 21.3742 6.1361 20.7869 6.4823 C 20.7918 6.4941 20.7821 6.4705 20.7869 6.4823 C 21.3028 6.4043 22.6986 6.136 23.25 5.7619 C 22.9773 6.3909 21.948 7.4368 21.1033 8.0223 C 21.2605 14.9536 15.9574 21 8.8415 21 Z"
      fill="#47ACDF"
    />,
    'TwitterIcon'
  )

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
        Copy Link
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
    >
      <>
        <Stack
          direction="row"
          spacing={4}
          alignItems="flex-start"
          sx={{ mb: 4 }}
        >
          {image != null && (
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Image
                src={image}
                alt={title[0].value}
                width={240}
                height={115}
                objectFit="cover"
                style={{ borderRadius: theme.spacing(2) }}
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
              <FacebookIcon sx={{ fontSize: 46 }} />
            </IconButton>
            <IconButton
              aria-label="Share to Twitter"
              href={`https://twitter.com/intent/tweet?url=${shareLink}`}
              target="_blank"
              rel="noopener"
            >
              <TwitterIcon sx={{ fontSize: 46 }} />
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
                    Copy Code
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

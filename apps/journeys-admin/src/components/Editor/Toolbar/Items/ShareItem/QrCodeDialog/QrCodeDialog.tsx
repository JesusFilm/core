import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FilledInput from '@mui/material/FilledInput'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grow from '@mui/material/Grow'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import SettingsIcon from '@core/shared/ui/icons/Settings'

interface QrCodeDialogProps {
  open: boolean
  onClose: () => void
  initialJourneyUrl?: string
}

// interface QRProps {
//   value: string | string[]
//   bgColor?: string
//   fgColor?: string
//   imageSettings?: {
//     src: string
//     height: number
//     width: number
//     excavate: boolean
//     opacity?: number
//   }
// }

export function QrCodeDialog({
  open,
  onClose,
  initialJourneyUrl
}: QrCodeDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const initialSlugUrl: string | undefined = undefined

  const [url, setUrl] = useState(initialSlugUrl ?? initialJourneyUrl ?? '')
  const [to, setTo] = useState(url)
  const [shortLink, setShortLink] = useState('domain')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#000000')
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1731275539163-09b8e4f7cac2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMDR8fHxlbnwwfHx8fHw%3D'
  )
  const [background, setBackground] = useState(false)
  const [imageHeight, setImageHeight] = useState(33)
  const [imageWidth, setImageWidth] = useState(33)
  const [imageOpacity, setImageOpacity] = useState(1)
  const [cors, setCors] = useState<'anonymous' | undefined>('anonymous')

  useEffect(() => {
    setUrl(initialSlugUrl ?? initialJourneyUrl ?? '')
    setTo(initialSlugUrl ?? initialJourneyUrl ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialJourneyUrl])

  function handleSubmit(): void {
    setUrl(to)
  }

  function handleDownloadQrCode(type: 'png' | 'svg'): void {
    const canvas: any = document.getElementById('qr-code-download')
    if (canvas != null) {
      try {
        const pngUrl = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream')
        const downloadLink = document.createElement('a')
        downloadLink.href = pngUrl
        downloadLink.download = `qr-code.${type}`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      } catch (error) {
        if (
          error.message ===
          "Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported."
        ) {
          enqueueSnackbar('Error downloading, check CORS setting', {
            variant: 'error',
            preventDuplicate: true
          })
        } else {
          enqueueSnackbar('Error downloading', {
            variant: 'error',
            preventDuplicate: true
          })
        }
      }
    }
  }

  const handleCopyClick = async (): Promise<void> => {
    await navigator.clipboard.writeText(url)
    enqueueSnackbar('Link copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
        setShowSettings(false)
      }}
      dialogTitle={{
        title: t('QR Code'),
        closeButton: true
      }}
    >
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={5}>
          <Stack direction="column">
            <QRCodeCanvas
              id="qr-code-download"
              title="QR Code"
              size={200}
              level="L"
              value={url}
              bgColor={bgColor}
              fgColor={fgColor}
              imageSettings={{
                src: imageUrl,
                height: imageHeight ?? 33,
                width: imageWidth ?? 33,
                excavate: !background,
                opacity: imageOpacity ?? 1,
                crossOrigin: cors
              }}
            />
          </Stack>

          <Stack
            direction="column"
            spacing={5}
            sx={{ justifyContent: 'center' }}
          >
            <Chip icon={<BarGroup3Icon />} sx={{ maxWidth: 100 }} label="30" />

            <ButtonGroup
              variant="contained"
              ref={anchorRef}
              sx={{ borderRadius: 3 }}
            >
              <Button
                fullWidth
                onClick={() => {
                  handleDownloadQrCode('png')
                  setShowDownloadMenu(false)
                }}
              >
                {t('Download PNG')}
              </Button>
              <Button onClick={() => setShowDownloadMenu(!showDownloadMenu)}>
                <ChevronDownIcon />
              </Button>
            </ButtonGroup>
            <Popper
              sx={{ zIndex: 1 }}
              open={showDownloadMenu}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom' ? 'center top' : 'center bottom'
                  }}
                >
                  <Paper>
                    <ClickAwayListener
                      onClickAway={() => setShowDownloadMenu(false)}
                    >
                      <MenuList id="split-button-menu" autoFocusItem>
                        <MenuItem
                          onClick={() => {
                            handleDownloadQrCode('svg')
                            setShowDownloadMenu(false)
                          }}
                        >
                          {t('Download SVG')}
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            void handleCopyClick()
                            setShowDownloadMenu(false)
                          }}
                        >
                          {t('Copy Short Link')}
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
            <Stack direction="row" spacing={4}>
              <FormControlLabel
                value="CORS"
                control={
                  <Switch
                    color="primary"
                    checked={cors === 'anonymous'}
                    onChange={(e) =>
                      setCors(e.target.checked ? 'anonymous' : undefined)
                    }
                  />
                }
                label="CORS"
              />
              <Typography variant="caption">
                {t(
                  'CORS needs to be on to download QR codes with images, but some images may not show up if this is on. May need to refresh the dialog to see changes'
                )}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Typography>
          {t(
            'Edit your QR code scan destination here. There’s no need to reprint after editing'
          )}
        </Typography>

        <FilledInput
          fullWidth
          hiddenLabel
          value={to}
          onChange={(e) => setTo(e.target.value)}
          disabled={!showSettings}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowSettings(!showSettings)}
                edge="end"
              >
                <SettingsIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </Stack>

      <Collapse in={showSettings}>
        <Typography color="error">
          {t(
            'You can redirect the QR code only to the NextSteps journeys or to your custom domain'
          )}
        </Typography>
        <Stack>
          <Button
            variant="contained"
            sx={{ maxWidth: 200, alignSelf: 'end' }}
            onClick={handleSubmit}
            disabled={to === url}
          >
            {t('Save Changes')}
          </Button>
        </Stack>

        <Stack spacing={4} sx={{ pt: 4 }}>
          <Divider />

          <TextField
            variant="filled"
            fullWidth
            label="ShortLink"
            value={shortLink}
            onChange={(e) => setShortLink(e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              variant="filled"
              fullWidth
              label="Color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
            />
            <TextField
              variant="filled"
              fullWidth
              label="Background Color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              variant="filled"
              fullWidth
              label="Image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <FormControlLabel
              value="Background"
              control={
                <Switch
                  color="primary"
                  checked={background}
                  onChange={(e) => setBackground(e.target.checked)}
                />
              }
              label="Background"
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              variant="filled"
              type="number"
              fullWidth
              label="Image Height"
              value={imageHeight}
              onChange={(e) => setImageHeight(e.target.value)}
            />
            <TextField
              variant="filled"
              type="number"
              fullWidth
              label="Image Width"
              value={imageWidth}
              onChange={(e) => setImageWidth(e.target.value)}
            />
          </Stack>

          <Stack>
            <Typography>{t('Image Opacity')}</Typography>
            <Slider
              aria-label="Image Opacity"
              defaultValue={1}
              step={0.01}
              min={0}
              max={1}
              marks={[
                { value: 0, label: '0%' },
                { value: 1, label: '100%' }
              ]}
              value={imageOpacity}
              onChange={(e, number) => setImageOpacity(number as number)}
            />
          </Stack>
        </Stack>
      </Collapse>
    </Dialog>
  )
}

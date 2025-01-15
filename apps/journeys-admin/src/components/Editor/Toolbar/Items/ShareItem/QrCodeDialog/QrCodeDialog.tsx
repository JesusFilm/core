import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import FilledInput from '@mui/material/FilledInput'
import Grow from '@mui/material/Grow'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { enqueueSnackbar } from 'notistack'
import { QRCodeCanvas } from 'qrcode.react'
import { MouseEvent, ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

import { CodeDestinationPopper } from './CodeDestinationPopper'
import { ScanCount } from './ScanCount'

interface QrCodeDialogProps {
  open: boolean
  onClose: () => void
  initialJourneyUrl?: string
}

export function QrCodeDialog({
  open,
  onClose,
  initialJourneyUrl
}: QrCodeDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const initialSlugUrl: string | undefined = undefined
  const [url, setUrl] = useState(initialSlugUrl ?? initialJourneyUrl ?? '')
  const [to, setTo] = useState(url)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  function handleMenuClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
    setShowDownloadMenu(!showDownloadMenu)
  }

  function handleDownloadQrCode(type: 'png' | 'svg'): void {
    const canvas = document.getElementById(
      'qr-code-download'
    ) as HTMLCanvasElement | null
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

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
      dialogTitle={{
        title: t('QR Code'),
        closeButton: true
      }}
    >
      <Stack spacing={7}>
        <Stack
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 4, sm: 7 },
            alignItems: 'center'
          }}
        >
          <Stack //this is the QRcode
            sx={{
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1
            }}
          >
            <QRCodeCanvas
              id="qr-code-download"
              title="QR Code"
              size={122}
              level="L"
              value={url}
            />
          </Stack>
          <Stack // the blue
            spacing={3}
            sx={{
              alignItems: { xs: 'center', sm: 'start' }
            }}
          >
            <ScanCount />
            <Stack
              spacing={3}
              sx={{
                alignItems: { xs: 'center', sm: 'start' }
              }}
            >
              <ButtonGroup
                variant="contained"
                sx={{
                  borderRadius: 2,
                  width: 200,
                  height: 42,
                  boxShadow: 'none',
                  '.MuiButtonGroup-grouped': {
                    borderColor: 'background.paper'
                  }
                }}
              >
                <Button
                  fullWidth
                  onClick={() => {
                    handleDownloadQrCode('png')
                    setShowDownloadMenu(false)
                  }}
                  sx={{
                    backgroundColor: 'secondary.main',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8
                  }}
                >
                  {t('Download PNG')}
                </Button>
                <Button
                  onClick={(e) => {
                    handleMenuClick(e)
                  }}
                  sx={{
                    backgroundColor: 'secondary.main',
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                >
                  <ChevronDownIcon />
                </Button>
              </ButtonGroup>
              <Popper
                sx={{ zIndex: 1 }}
                open={showDownloadMenu}
                anchorEl={anchorEl}
                transition
                disablePortal
              >
                {({ TransitionProps }) => (
                  <Grow {...TransitionProps}>
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
                              // void handleCopyClick()
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
              <Typography
                variant="body2"
                color="secondary.main"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              >
                {t(
                  'Here is your unique QR code that will direct people to your journey when scanned.'
                )}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Divider />
        <Stack spacing={5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'start' }
            }}
          >
            <Typography variant="subtitle1" color="secondary.dark">
              {t('Code Destination')}
            </Typography>
            <CodeDestinationPopper />
          </Stack>
          <FilledInput
            fullWidth
            hiddenLabel
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled
          />
        </Stack>
      </Stack>
    </Dialog>
  )
}

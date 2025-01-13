import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
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
import { ReactElement, useRef, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

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
      <Stack direction="row" spacing={7} sx={{ height: '130px' }}>
        <Stack
          sx={{
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1
          }}
        >
          <QRCodeCanvas
            id="qr-code-download"
            title="QR Code"
            size={118}
            level="L"
            value={url}
          />
        </Stack>
        <Stack spacing={3}>
          <ScanCount />
          <ButtonGroup
            variant="contained"
            ref={anchorRef}
            sx={{ borderRadius: 2, width: 200, height: 42 }}
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
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
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
          <Typography variant="body2" color="secondary.main">
            {t(
              'Here is your unique QR code that will direct people to your journey when scanned.'
            )}
          </Typography>
        </Stack>
      </Stack>
    </Dialog>
  )
}

import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { enqueueSnackbar } from 'notistack'
import { MouseEvent, ReactElement, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

interface DownloadQrCodeProps {
  shortLink?: string
  loading?: boolean
}

export function DownloadQrCode({
  shortLink,
  loading
}: DownloadQrCodeProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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

  async function handleCopyClick(): Promise<void> {
    await navigator.clipboard.writeText(shortLink ?? '')
    enqueueSnackbar('Link copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: { xs: 'center', sm: 'start' }
      }}
    >
      <ButtonGroup
        variant="contained"
        disabled={shortLink == null || loading}
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
          color="secondary"
          onClick={() => {
            handleDownloadQrCode('png')
            setShowDownloadMenu(false)
          }}
          sx={{
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8
          }}
        >
          {t('Download PNG')}
        </Button>
        <Button
          color="secondary"
          onClick={(e) => {
            handleMenuClick(e)
          }}
          sx={{
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
              <ClickAwayListener onClickAway={() => setShowDownloadMenu(false)}>
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
    </Stack>
  )
}

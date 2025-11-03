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

interface CodeActionButtonProps {
  shortLink?: string
  loading?: boolean
  handleGenerateQrCode: () => Promise<void>
}

export function CodeActionButton({
  shortLink,
  loading,
  handleGenerateQrCode
}: CodeActionButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  function handleMenuClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
    setShowDownloadMenu(!showDownloadMenu)
  }

  function handleDownload(): void {
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
        downloadLink.download = 'qr-code.png'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        enqueueSnackbar(t('Error downloading'), {
          variant: 'error',
          preventDuplicate: true
        })
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
      {!loading && shortLink == null ? (
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="medium"
          onClick={handleGenerateQrCode}
        >
          {t('Generate Code')}
        </Button>
      ) : (
        <ButtonGroup
          variant="contained"
          disabled={shortLink == null || loading}
          sx={{
            boxShadow: 'none',
            '.MuiButtonGroup-grouped': {
              borderColor: 'background.paper'
            }
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            size="medium"
            onClick={() => {
              handleDownload()
              setShowDownloadMenu(false)
            }}
          >
            {t('Download PNG')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            data-testid="DownloadDropdown"
            onClick={(e) => {
              handleMenuClick(e)
            }}
          >
            <ChevronDownIcon />
          </Button>
        </ButtonGroup>
      )}

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

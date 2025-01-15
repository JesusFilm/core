import Grow from '@mui/material/Grow'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

export function CodeDestinationPopper(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [showPopper, setShowPopper] = useState(false)

  function handleOpen(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
    setShowPopper(true)
  }

  function handleClose(): void {
    setAnchorEl(null)
    setShowPopper(false)
  }

  return (
    <>
      <IconButton
        onMouseEnter={(e) => handleOpen(e)}
        onMouseLeave={() => handleClose()}
      >
        <InformationCircleContainedIcon />
      </IconButton>
      <Popper
        sx={{ zIndex: 1 }}
        open={showPopper}
        anchorEl={anchorEl}
        disablePortal
        transition
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={350}>
            <Paper>
              <Typography sx={{ p: 4, width: 284 }}>
                {t(
                  'You can edit your QR code scan destination. There’s no need to reprint after editing'
                )}
              </Typography>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

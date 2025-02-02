import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import MuiPopper from '@mui/material/Popper'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

const Popper = styled(MuiPopper)(() => ({
  zIndex: 1,
  '&[data-popper-placement*="top"] .arrow': {
    bottom: 0,
    left: 0,
    marginBottom: '-0.9em',
    width: '3em',
    height: '1em'
  }
}))

const Arrow = styled('span')(({ theme }) => ({
  position: 'absolute',
  fontSize: 7,
  width: '3em',
  height: '3em',
  '&::before': {
    content: '""',
    margin: 'auto',
    display: 'block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '1em 1em 0 1em',
    borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
    filter: 'drop-shadow(0.5px 1px 0.3px rgba(0,0,0,0.3))'
  }
}))

export function CodeDestinationPopper(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [arrowRef, setArrowRef] = useState<null | HTMLElement>(null)
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
        disableRipple
      >
        <InformationCircleContainedIcon />
      </IconButton>
      <Popper
        open={showPopper}
        anchorEl={anchorEl}
        disablePortal
        transition
        className="popper"
        placement="top"
        modifiers={[
          {
            name: 'arrow',
            enabled: true,
            options: {
              element: arrowRef
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box>
              <Arrow className="arrow" ref={setArrowRef} />
              <Paper>
                <Typography
                  variant="body2"
                  sx={{ p: 4, maxWidth: { xs: 250, sm: 284 } }}
                >
                  {t(
                    'You can edit your QR code scan destination. There’s no need to reprint after editing.'
                  )}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        )}
      </Popper>
    </>
  )
}

import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import X2Icon from '@core/shared/ui/icons/X2'
import IconButton from '@mui/material/IconButton'
import { Theme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'

interface DrawerTitleProps {
  title?: string
  onClose?: () => void
}

function DrawerTitle({ title, onClose }: DrawerTitleProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
          {onClose != null && (
            <IconButton
              aria-label="close-image-library"
              onClick={onClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <X2Icon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
    </>
  )
}

interface DrawerProps {
  title?: string
  children?: ReactNode
  open?: boolean
  onClose?: () => void
}

export function Drawer({
  title,
  children,
  open,
  onClose
}: DrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { zIndex } = useTheme()

  return (
    <MuiDrawer
      anchor={smUp ? 'right' : 'bottom'}
      variant={open != null ? 'temporary' : 'permanent'}
      SlideProps={{ appear: true }}
      open={open}
      elevation={0}
      hideBackdrop
      sx={{
        '& .MuiDrawer-paper':
          open != null
            ? {
                borderRadius: 4,
                width: DRAWER_WIDTH,
                top: EDIT_TOOLBAR_HEIGHT + 20,
                right: 20,
                bottom: 20,
                height: 'auto'
              }
            : {
                borderRadius: 4,
                top: 20,
                right: 20,
                bottom: 20,
                width: DRAWER_WIDTH,
                height: 'auto'
              }
      }}
    >
      <DrawerTitle title={title} onClose={onClose} />
      {children}
    </MuiDrawer>
  )
}

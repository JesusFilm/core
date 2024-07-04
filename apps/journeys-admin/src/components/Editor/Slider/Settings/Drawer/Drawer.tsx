import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Theme, alpha } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, ReactNode } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { DRAWER_WIDTH } from '../../../constants'

interface DrawerTitleProps {
  title?: string
  onClose?: () => void
}

function DrawerTitle({ title, onClose }: DrawerTitleProps): ReactElement {
  return (
    <>
      <AppBar data-testid="DrawerTitle" position="static" color="default">
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            pt: 2
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 6,
              bgcolor: '#AAACBB',
              borderRadius: '12px'
            }}
          />
        </Box>
        <Toolbar
          data-testid="Toolbar"
          sx={{
            minHeight: { xs: 64, sm: 48 },
            maxHeight: { xs: 64, sm: 48 },
            pl: { sm: 4 },
            pr: { sm: 5 },

            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Typography
            data-testid="CardProp"
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

  return (
    <MuiDrawer
      data-testid="SettingsDrawer"
      anchor={smUp ? 'right' : 'bottom'}
      variant={open != null ? 'persistent' : 'permanent'}
      SlideProps={{ appear: true }}
      open={open}
      elevation={0}
      hideBackdrop
      sx={{
        '& .MuiDrawer-paper': {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          width: smUp ? DRAWER_WIDTH : 'auto',
          left: { xs: 0, sm: 'auto' },
          top: { xs: 0, sm: 20 },
          right: { xs: 0, sm: 20 },
          bottom: 0,
          height: 'calc(100% - 20px)'
        }
      }}
    >
      <DrawerTitle title={title} onClose={onClose} />
      <Box
        data-testid="SettingsDrawerContent"
        className="swiper-no-swiping"
        sx={{ flexGrow: 1, overflow: 'auto', mb: { sm: 4 } }}
      >
        {children}
      </Box>
    </MuiDrawer>
  )
}

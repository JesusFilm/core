import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
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
      <AppBar position="static" color="default">
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
              borderRadius: '3px'
            }}
          />
        </Box>
        <Toolbar
          sx={{ minHeight: { xs: 64, sm: 48 }, maxHeight: { xs: 64, sm: 48 } }}
        >
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
        '& .MuiDrawer-paper':
          open != null
            ? {
                // persistent drawer
                borderRadius: 4,
                borderBottomLeftRadius: { xs: 0, sm: 16 },
                borderBottomRightRadius: { xs: 0, sm: 16 },
                width: smUp ? DRAWER_WIDTH : 'auto',
                top: { xs: 0, sm: 20 },
                left: { xs: 0, sm: 'auto' },
                right: { xs: 0, sm: 20 },
                bottom: { xs: 0, sm: 20 },
                height: 'auto'
              }
            : {
                // permanent drawer
                borderRadius: 4,
                borderBottomLeftRadius: { xs: 0, sm: 16 },
                borderBottomRightRadius: { xs: 0, sm: 16 },
                width: smUp ? DRAWER_WIDTH : 'auto',
                left: { xs: 0, sm: 'auto' },
                top: { xs: 0, sm: 20 },
                right: { xs: 0, sm: 20 },
                bottom: { xs: 0, sm: 'unset' },
                height: 'auto',
                minHeight: 'calc(100% - 40px)',
                maxHeight: 'calc(100% - 4px)'
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

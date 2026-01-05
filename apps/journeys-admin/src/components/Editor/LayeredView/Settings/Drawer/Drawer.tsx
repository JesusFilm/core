import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { type Theme, alpha } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { ReactElement, ReactNode } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { DRAWER_WIDTH } from '../../../constants'

interface DrawerTitleProps {
  title?: string
  onClose?: () => void
}

export function DrawerTitle({
  title,
  onClose
}: DrawerTitleProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default">
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            pt: 2,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.5)
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
          sx={{
            minHeight: { xs: 64, md: 48 },
            maxHeight: { xs: 64, md: 48 },
            pl: { md: 4 },
            pr: { xs: 4.5, md: 5 },
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.5)
          }}
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
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  return (
    <Stack
      data-testid="SettingsDrawer"
      direction="column"
      sx={{
        position: 'fixed',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        width: { xs: 'auto', md: DRAWER_WIDTH },
        left: { xs: 0, md: 'auto' },
        top: { xs: 0, md: 32 },
        right: { xs: 0, md: 32 },
        bottom: 0,
        height: 'calc(100% - 20px)',
        backgroundColor: 'background.paper',
        zIndex: (theme) => theme.zIndex.drawer
      }}
    >
      <DrawerTitle title={title} onClose={onClose} />
      <Box
        data-testid="SettingsDrawerContent"
        className="swiper-no-swiping"
        sx={{ flexGrow: 1, overflow: 'auto', mb: { md: 4 } }}
      >
        {children}
      </Box>
    </Stack>
  )
}

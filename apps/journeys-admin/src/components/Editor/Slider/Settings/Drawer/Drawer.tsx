import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Portal from '@mui/material/Portal'
import Stack from '@mui/material/Stack'
import { type Theme, alpha } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { ReactElement, ReactNode } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import {
  DRAWER_GAP,
  DRAWER_WIDTH,
  EDIT_TOOLBAR_HEIGHT
} from '../../../constants'
import { useEditorLayout } from '../../../EditorLayoutContext'
import { LAYERED_DRAWER_HEIGHT } from '../../Content/Canvas/utils/calculateDimensions'

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
  const { isLayered } = useEditorLayout()

  // in the layered desktop view, permanent settings panels render in-flow
  // inside the editor drawer instead of as a fixed-position drawer (fixed
  // positioning breaks inside the drawer's transformed container). Panels
  // controlled by `open` (media libraries) keep the sliding drawer behaviour.
  if (isLayered && open == null) {
    return (
      <Stack
        data-testid="SettingsDrawer"
        direction="column"
        component={Paper}
        elevation={0}
        border={1}
        borderColor="divider"
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <DrawerTitle title={title} onClose={onClose} />
        <Box
          data-testid="SettingsDrawerContent"
          className="swiper-no-swiping"
          sx={{ flexGrow: 1, overflow: 'auto', mb: 4 }}
        >
          {children}
        </Box>
      </Stack>
    )
  }

  // in the layered desktop view the media library drawer must escape the
  // editor drawer's transformed paper (which breaks fixed positioning), so
  // it portals to the body and floats over the settings slot
  const isLayeredLibrary = isLayered && open != null

  return (
    // disablePortal makes this an inert pass-through everywhere except the
    // layered media-library case, where it lifts the drawer out to the body
    <Portal disablePortal={!isLayeredLibrary}>
      <MuiDrawer
        data-testid="SettingsDrawer"
        anchor={mdUp ? 'right' : 'bottom'}
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
            width: { xs: 'auto', md: DRAWER_WIDTH },
            left: { xs: 0, md: 'auto' },
            ...(isLayeredLibrary
              ? {
                  // keep the floating library below the app bar and within the
                  // viewport: never start above the app bar, and cap the height
                  // so the bottom of the list (and its content) is never clipped
                  // off the bottom of the screen on shorter laptops
                  top: `max(${EDIT_TOOLBAR_HEIGHT + DRAWER_GAP}px, calc(50% - ${LAYERED_DRAWER_HEIGHT / 2}px))`,
                  right: DRAWER_GAP,
                  bottom: 'auto',
                  height: LAYERED_DRAWER_HEIGHT,
                  maxHeight: `calc(100% - ${EDIT_TOOLBAR_HEIGHT + DRAWER_GAP * 2}px)`,
                  zIndex: (theme) => theme.zIndex.drawer + 1
                }
              : {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  top: { xs: 0, md: 32 },
                  right: { xs: 0, md: 32 },
                  bottom: 0,
                  height: { xs: '100%', md: 'calc(100% - 20px)' }
                })
          }
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
      </MuiDrawer>
    </Portal>
  )
}

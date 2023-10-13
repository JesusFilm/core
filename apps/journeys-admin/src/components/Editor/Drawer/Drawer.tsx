import Close from '@mui/icons-material/Close'
import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { Theme } from '@mui/material/styles'
import zIndex from '@mui/material/styles/zIndex'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, ReactNode } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { Attributes } from '../ControlPanel/Attributes'
import { BlocksTab } from '../ControlPanel/BlocksTab'

export const DRAWER_WIDTH = 328

interface DrawerContentProps {
  title?: string
  children?: ReactNode
  handleDrawerToggle: () => void
}

function DrawerContent({
  title,
  children,
  handleDrawerToggle
}: DrawerContentProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
            data-testid="drawer-title"
          >
            {title}
          </Typography>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      {children}
    </>
  )
}

export function Drawer(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: {
      drawerTitle: title,
      drawerChildren: children,
      drawerMobileOpen: mobileOpen,
      steps,
      selectedBlock,
      selectedComponent,
      selectedStep,
      activeTab,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()

  const selected = selectedComponent ?? selectedBlock ?? 'none'

  const handleDrawerToggle = (): void => {
    dispatch({
      type: 'SetDrawerMobileOpenAction',
      mobileOpen: !mobileOpen
    })
  }

  // console.log({ activeTab })

  return smUp ? (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'none', sm: 'block' },
        position: 'absolute',
        top: '40px',
        right: '40px',
        bottom: '0',
        width: '328px',
        borderLeft: 1,
        borderColor: 'divider',
        borderRadius: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 999
      }}
    >
      <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
        {selected !== 'none' &&
          selectedStep !== undefined &&
          (activeTab === 2 ? (
            <BlocksTab />
          ) : (
            <Attributes selected={selected} step={selectedStep} />
          ))}
        {children}
      </DrawerContent>
    </Paper>
  ) : (
    <>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
          {children}
        </DrawerContent>
      </MuiDrawer>
    </>
  )
}

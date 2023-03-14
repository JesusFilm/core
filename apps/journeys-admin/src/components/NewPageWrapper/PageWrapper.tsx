import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'
import { CSSObject, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AuthUser } from 'next-firebase-auth'
import { NavigationDrawer } from '../PageWrapper/NavigationDrawer'
import { MainPanelBody } from './MainPanelBody'
import { MainPanelHeader } from './MainPanelHeader'
import { AppHeader } from './AppHeader'
import { SidePanel } from './SidePanel'

export interface PageWrapperProps {
  backHref?: string
  title: string
  menu?: ReactNode
  children?: ReactNode
  showAppHeader?: boolean
  sidePanelTitle?: string
  sidePanelChildren?: ReactNode
  bottomPanelChildren?: ReactNode
  authUser?: AuthUser
}

export function PageWrapper({
  backHref,
  showAppHeader = true,
  title,
  menu: customMenu,
  sidePanelTitle,
  sidePanelChildren,
  bottomPanelChildren,
  children,
  authUser
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const theme = useTheme()
  const viewportHeight = use100vh()
  const toolbarStyle: { variant: 'dense' | 'regular'; height: number } = {
    variant: 'dense',
    // Height of the dense toolbar variant
    height:
      theme.components?.MuiToolbar != null
        ? ((theme.components.MuiToolbar.styleOverrides?.dense as CSSObject)
            .maxHeight as number)
        : 12
  }

  return (
    <Box
      sx={{
        height: viewportHeight ?? '100vh',
        overflow: 'hidden',
        [theme.breakpoints.only('xs')]: { overflowY: 'auto' }
      }}
    >
      <Stack direction={{ sm: 'row' }} sx={{ height: 'inherit' }}>
        <NavigationDrawer open={open} onClose={setOpen} authUser={authUser} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            backgroundColor: 'background.default',
            width: { xs: '100vw', sm: 'calc(100vw - 72px)' },
            pt: { xs: `${toolbarStyle.height}px`, sm: 0 },
            pb: { xs: bottomPanelChildren != null ? '300px' : 0, sm: 0 }
          }}
        >
          {showAppHeader && (
            <AppHeader
              toolbarStyle={toolbarStyle}
              onClick={() => setOpen(!open)}
            />
          )}

          <Stack component="main" sx={{ width: 'inherit' }}>
            <MainPanelHeader
              title={title}
              toolbarStyle={toolbarStyle}
              backHref={backHref}
              menu={customMenu}
            />
            <MainPanelBody bottomPanelChildren={bottomPanelChildren}>
              {children}
            </MainPanelBody>
          </Stack>

          {sidePanelChildren != null && (
            <SidePanel title={sidePanelTitle}>{sidePanelChildren}</SidePanel>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

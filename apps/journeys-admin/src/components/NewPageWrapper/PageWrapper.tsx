import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AuthUser } from 'next-firebase-auth'
import { NavigationDrawer } from '../PageWrapper/NavigationDrawer'
import { MainPanelBody } from './MainPanelBody'
import { MainPanelHeader } from './MainPanelHeader'
import { AppHeader } from './AppHeader'
import { SidePanel } from './SidePanel'
import { usePageWrapperStyles } from './utils/usePageWrapperStyles'

interface PageWrapperProps {
  backHref?: string
  title: string
  menu?: ReactNode
  children?: ReactNode
  showAppHeader?: boolean
  sidePanelTitle?: string
  /**
   * Add default side panel padding and border by wrapping components with `SidePanelContainer`
   */
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
  const { navbar, toolbar, bottomPanel, sidePanel } = usePageWrapperStyles()

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
            width: { xs: '100vw', sm: `calc(100vw - ${navbar.width})` },
            pt: { xs: `${toolbar.height}px`, sm: 0 },
            pb: {
              xs: bottomPanelChildren != null ? bottomPanel.height : 0,
              sm: 0
            }
          }}
        >
          {showAppHeader && <AppHeader onClick={() => setOpen(!open)} />}

          <Stack
            component="main"
            sx={{
              width: {
                xs: 'inherit',
                sm:
                  sidePanelChildren != null
                    ? `calc(100vw - ${navbar.width} - ${sidePanel.width})`
                    : 'inherit'
              }
            }}
          >
            <MainPanelHeader
              title={title}
              backHref={backHref}
              menu={customMenu}
            />
            <MainPanelBody bottomPanelChildren={bottomPanelChildren}>
              {children}
            </MainPanelBody>
          </Stack>
          {sidePanelChildren != null && (
            <SidePanel
              title={sidePanelTitle}
              hasBottomPanel={bottomPanelChildren != null}
            >
              {sidePanelChildren}
            </SidePanel>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

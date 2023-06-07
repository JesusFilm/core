import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { AuthUser } from 'next-firebase-auth'
import { useRouter } from 'next/router'
import { PageProvider, PageState } from '../../libs/PageWrapperProvider'
import { NavigationDrawer } from './NavigationDrawer'
import { MainPanelBody } from './MainPanelBody'
import { MainPanelHeader } from './MainPanelHeader'
import { AppHeader } from './AppHeader'
import { SidePanel } from './SidePanel'
import { usePageWrapperStyles } from './utils/usePageWrapperStyles'

interface PageWrapperProps {
  backHref?: string
  title: string | ReactNode
  menu?: ReactNode
  children?: ReactNode
  showAppHeader?: boolean
  sidePanelTitle?: string | ReactNode
  /**
   * Add default side panel padding and border by wrapping components with `SidePanelContainer`
   */
  sidePanelChildren?: ReactNode
  bottomPanelChildren?: ReactNode
  authUser?: AuthUser
  initialState?: Partial<PageState>
  backHrefHistory?: boolean
  disableGutters?: boolean
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
  authUser,
  initialState,
  backHrefHistory,
  disableGutters
}: PageWrapperProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const theme = useTheme()
  const viewportHeight = use100vh()
  const { navbar, toolbar, bottomPanel, sidePanel } = usePageWrapperStyles()
  const router = useRouter()

  return (
    <PageProvider initialState={initialState}>
      <Box
        sx={{
          height: viewportHeight ?? '100vh',
          overflow: 'hidden'
        }}
      >
        <Stack direction={{ md: 'row' }} sx={{ height: 'inherit' }}>
          <NavigationDrawer
            open={open}
            onClose={setOpen}
            authUser={authUser}
            router={router}
          />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              backgroundColor: 'background.default',
              width: { xs: '100vw', md: `calc(100vw - ${navbar.width})` },
              pt: { xs: `${toolbar.height}px`, md: 0 },
              pb: {
                xs: bottomPanelChildren != null ? bottomPanel.height : 0,
                md: 0
              }
            }}
          >
            {showAppHeader && <AppHeader onClick={() => setOpen(!open)} />}

            <Stack
              component="main"
              sx={{
                [theme.breakpoints.down('md')]: { overflowY: 'auto' },
                width: {
                  xs: 'inherit',
                  md:
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
                backHrefHistory={backHrefHistory}
              />
              <MainPanelBody
                bottomPanelChildren={bottomPanelChildren}
                disableGutters={disableGutters}
              >
                {children}
              </MainPanelBody>
            </Stack>
            {sidePanelChildren != null && (
              <SidePanel title={sidePanelTitle}>{sidePanelChildren}</SidePanel>
            )}
          </Stack>
        </Stack>
      </Box>
    </PageProvider>
  )
}

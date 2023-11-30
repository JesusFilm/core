import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, ReactNode, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { PageProvider, PageState } from '../../libs/PageWrapperProvider'

import { AppHeader } from './AppHeader'
import { MainPanelBody } from './MainPanelBody'
import { MainPanelHeader } from './MainPanelHeader'
import { NavigationDrawer } from './NavigationDrawer'
import { SidePanel } from './SidePanel'
import { usePageWrapperStyles } from './utils/usePageWrapperStyles'

interface PageWrapperProps {
  showAppHeader?: boolean
  title?: string
  showMainHeader?: boolean
  backHref?: string
  backHrefHistory?: boolean
  mainHeaderChildren?: ReactNode
  mainBodyPadding?: boolean
  children?: ReactNode
  bottomPanelChildren?: ReactNode
  sidePanelTitle?: ReactNode
  /**
   * Add default side panel padding and border by wrapping components with `SidePanelContainer`
   */
  sidePanelChildren?: ReactNode
  // Either render default SidePanel with sidePanelChildren
  // Or render customSidePanel
  customSidePanel?: ReactNode
  user?: User
  initialState?: Partial<PageState>
}

export function PageWrapper({
  showAppHeader = true,
  title,
  showMainHeader = true,
  backHref,
  backHrefHistory,
  mainHeaderChildren,
  mainBodyPadding = true,
  children,
  bottomPanelChildren,
  sidePanelTitle = '',
  sidePanelChildren,
  customSidePanel,
  user,
  initialState
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
          minHeight: '-webkit-fill-available',
          [theme.breakpoints.down('md')]: { overflowY: 'auto' },
          overflow: 'hidden'
        }}
        data-testid="JourneysAdminPageWrapper"
      >
        <Stack direction={{ md: 'row' }} sx={{ height: 'inherit' }}>
          <NavigationDrawer
            open={open}
            onClose={setOpen}
            user={user}
            router={router}
          />

          <Stack
            flexGrow={1}
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              backgroundColor: 'background.default',
              width: { xs: '100vw', md: `calc(100vw - ${navbar.width})` },
              pt: { xs: toolbar.height, md: 0 },
              pb: {
                xs: bottomPanelChildren != null ? bottomPanel.height : 0,
                md: 0
              }
            }}
          >
            {showAppHeader && <AppHeader onClick={() => setOpen(!open)} />}

            <Stack
              component="main"
              flexGrow={1}
              sx={{
                width: {
                  xs: 'inherit',
                  md:
                    sidePanelChildren != null || customSidePanel != null
                      ? `calc(100vw - ${navbar.width} - ${sidePanel.width})`
                      : 'inherit'
                }
              }}
            >
              {showMainHeader && (
                <MainPanelHeader
                  title={title}
                  backHref={backHref}
                  backHrefHistory={backHrefHistory}
                >
                  {mainHeaderChildren}
                </MainPanelHeader>
              )}
              <MainPanelBody
                mainBodyPadding={mainBodyPadding}
                bottomPanelChildren={bottomPanelChildren}
              >
                {children}
              </MainPanelBody>
            </Stack>
            {sidePanelChildren != null && (
              <SidePanel title={sidePanelTitle}>{sidePanelChildren}</SidePanel>
            )}
            {customSidePanel != null && customSidePanel}
          </Stack>
        </Stack>
      </Box>
    </PageProvider>
  )
}

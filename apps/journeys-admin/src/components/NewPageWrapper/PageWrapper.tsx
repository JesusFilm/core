import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SxProps, useTheme } from '@mui/material/styles'
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
  mainHeaderChildren?: ReactNode
  hiddenPanelHeader?: boolean
  backHref?: string
  backHrefHistory?: boolean
  children?: ReactNode
  bottomPanelChildren?: ReactNode
  sidePanelTitle?: string | ReactNode
  /**
   * Add default side panel padding and border by wrapping components with `SidePanelContainer`
   */
  sidePanelChildren?: ReactNode
  user?: User
  initialState?: Partial<PageState>
  mainPanelSx?: SxProps
}

export function PageWrapper({
  showAppHeader = true,
  title,
  mainHeaderChildren,
  hiddenPanelHeader,
  backHref,
  backHrefHistory,
  children,
  bottomPanelChildren,
  sidePanelTitle,
  sidePanelChildren,
  user,
  initialState,
  mainPanelSx
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
      >
        <Stack direction={{ md: 'row' }} sx={{ height: 'inherit' }}>
          <NavigationDrawer
            open={open}
            onClose={setOpen}
            user={user}
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
                width: {
                  xs: 'inherit',
                  md:
                    sidePanelChildren != null
                      ? `calc(100vw - ${navbar.width} - ${sidePanel.width})`
                      : 'inherit'
                }
              }}
            >
              {hiddenPanelHeader !== true && (
                <MainPanelHeader
                  title={title}
                  backHref={backHref}
                  backHrefHistory={backHrefHistory}
                >
                  {mainHeaderChildren}
                </MainPanelHeader>
              )}
              <MainPanelBody
                bottomPanelChildren={bottomPanelChildren}
                sx={mainPanelSx}
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

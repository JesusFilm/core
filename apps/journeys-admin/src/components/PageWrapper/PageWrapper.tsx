import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import NoSsr from '@mui/material/NoSsr'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import { UserNavigation } from 'apps/journeys-admin/src/components/PageWrapper/UserNavigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, Suspense, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { NavigationDrawer } from '@core/admin/ui/NavigationDrawer'
import Bag5Icon from '@core/shared/ui/icons/Bag5'
import JourneysIcon from '@core/shared/ui/icons/Journeys'

import nextstepsTitle from '../../../../../../apps/journeys-admin/public/nextsteps-title.svg'
import taskbarIcon from '../../../../../../apps/journeys-admin/public/taskbar-icon.svg'
import { PageProvider, PageState } from '../../libs/PageWrapperProvider'

import { AppHeader } from './AppHeader'
import { MainPanelBody } from './MainPanelBody'
import { MainPanelHeader } from './MainPanelHeader'
import { SidePanel } from './SidePanel'
import { usePageWrapperStyles } from './utils/usePageWrapperStyles'

interface PageWrapperProps {
  showAppHeader?: boolean
  title?: string
  showMainHeader?: boolean
  showNavBar?: boolean
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
  showNavBar = true,
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
  const [tooltip, setTooltip] = useState<string | undefined>()
  const selectedPage = router?.pathname?.split('/')[1]
  const { t } = useTranslation('apps-journeys-admin')

  const UserNavigation = dynamic(
    async () =>
      await import(
        /* webpackChunkName: "UserNavigation" */
        './UserNavigation'
      ).then((mod) => mod.UserNavigation),
    { ssr: false }
  )

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
          {showNavBar && (
            <NavigationDrawer open={open} onClose={setOpen}>
              <NextLink href="/" passHref legacyBehavior>
                <Tooltip title={tooltip} placement="right" arrow>
                  <ListItemButton
                    selected={
                      selectedPage === 'journeys' || selectedPage === ''
                    }
                    data-testid="NavigationListItemDiscover"
                  >
                    <ListItemIcon>
                      <Badge
                        variant="dot"
                        color="warning"
                        overlap="circular"
                        invisible={tooltip == null}
                      >
                        <JourneysIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Discover')}
                      primaryTypographyProps={{
                        style: { whiteSpace: 'nowrap' }
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </NextLink>
              <NextLink href="/templates" passHref legacyBehavior>
                <ListItemButton
                  selected={selectedPage === 'templates'}
                  data-testid="NavigationListItemTemplates"
                >
                  <ListItemIcon>
                    <Bag5Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('Templates')}
                    primaryTypographyProps={{ style: { whiteSpace: 'nowrap' } }}
                  />
                </ListItemButton>
              </NextLink>
              {user?.id != null && (
                <NoSsr>
                  <Suspense>
                    <UserNavigation
                      user={user}
                      selectedPage={selectedPage}
                      setTooltip={setTooltip}
                    />
                  </Suspense>
                </NoSsr>
              )}
              <ListItem component="div" sx={{ flexGrow: '1 !important' }} />
              <ListItem component="div" sx={{ mb: 1.5 }}>
                <ListItemIcon>
                  <Image
                    src={taskbarIcon}
                    width={32}
                    height={32}
                    alt="Next Steps Logo"
                  />
                </ListItemIcon>
                <Image
                  src={nextstepsTitle}
                  width={106}
                  height={24}
                  alt="Next Steps Title"
                />
              </ListItem>
            </NavigationDrawer>
          )}

          <Stack
            flexGrow={1}
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              backgroundColor: 'background.default',
              width: {
                xs: '100vw',
                md: showNavBar ? `calc(100vw - ${navbar.width})` : '100vw'
              },
              pt: { xs: showAppHeader ? toolbar.height : 0, md: 0 },
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

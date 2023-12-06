import Backdrop from '@mui/material/Backdrop'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import type { User } from 'next-firebase-auth'
import { ReactElement, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Bag5Icon from '@core/shared/ui/icons/Bag5'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import JourneysIcon from '@core/shared/ui/icons/Journeys'

import nextstepsTitle from '../../../../public/nextsteps-title.svg'
import taskbarIcon from '../../../../public/taskbar-icon.svg'

const DRAWER_WIDTH = '237px'

const UserNavigation = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "UserNavigation" */
      './UserNavigation'
    ).then((mod) => mod.UserNavigation),
  { ssr: false }
)

interface NavigationDrawerProps {
  open?: boolean
  onClose?: (value: boolean) => void
  user?: User
  selectedPage?: string
}

export function NavigationDrawer({
  open,
  onClose,
  user,
  selectedPage
}: NavigationDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [tooltip, setTooltip] = useState<string | undefined>()

  function handleClose(): void {
    onClose?.(open !== true)
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      variant="permanent"
      anchor="left"
      data-testid="NavigationDrawer"
      sx={{
        display: 'flex',
        width: { xs: 0, md: 72 },
        '& .MuiDrawer-paper': {
          border: 0,
          backgroundColor: 'secondary.dark',
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width'),
          width: open === true ? DRAWER_WIDTH : { xs: 0, md: 72 },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }
      }}
    >
      <Backdrop open={open === true} onClick={handleClose} />
      <List
        component="nav"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          gap: 1.5,
          '& .MuiListItemButton-root, & .MuiListItem-root': {
            paddingLeft: 0,
            flexGrow: 0,
            '& .MuiListItemIcon-root': {
              minWidth: 'unset',
              width: '72px',
              justifyContent: 'center'
            },
            '& .MuiListItemText-primary': {
              fontSize: '15px',
              fontWeight: 'bold'
            },
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: 'secondary.light',
              transition: (theme) => theme.transitions.create('color')
            },
            '&.Mui-selected, &:hover, &.Mui-selected:hover': {
              backgroundColor: 'transparent',
              '& .MuiListItemIcon-root': {
                color: 'background.paper'
              },
              '& .MuiListItemText-primary': {
                color: 'background.paper'
              }
            }
          }
        }}
      >
        <ListItemButton
          onClick={handleClose}
          data-testid="NavigationListItemToggle"
        >
          <ListItemIcon
            sx={{
              '> .MuiSvgIcon-root': {
                backgroundColor: 'secondary.light',
                color: 'secondary.dark',
                borderRadius: 2,
                transition: (theme) =>
                  theme.transitions.create(['transform', 'background-color']),
                transform: {
                  md: open === true ? 'rotate(180deg)' : 'rotate(0deg)'
                },
                '&:hover': {
                  backgroundColor: 'background.paper'
                }
              }
            }}
          >
            <ChevronRightIcon />
          </ListItemIcon>
        </ListItemButton>
        <NextLink href="/" passHref legacyBehavior prefetch={false}>
          <Tooltip title={tooltip} placement="right" arrow>
            <ListItemButton
              selected={selectedPage === 'journeys' || selectedPage === ''}
              data-testid="NavigationListItemDiscover"
            >
              <ListItemIcon>
                <JourneysIcon />
              </ListItemIcon>
              <ListItemText primary={t('Discover')} />
            </ListItemButton>
          </Tooltip>
        </NextLink>
        <NextLink href="/templates" passHref legacyBehavior prefetch={false}>
          <ListItemButton
            selected={selectedPage === 'templates'}
            data-testid="NavigationListItemTemplates"
          >
            <ListItemIcon>
              <Bag5Icon />
            </ListItemIcon>
            <ListItemText primary={t('Templates')} />
          </ListItemButton>
        </NextLink>
        {user?.id != null && (
          <Suspense>
            <UserNavigation
              user={user}
              selectedPage={selectedPage}
              setTooltip={setTooltip}
            />
          </Suspense>
        )}
        <ListItem component="div" sx={{ flexGrow: '1 !important' }} />
        <ListItem component="div">
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
      </List>
    </Drawer>
  )
}

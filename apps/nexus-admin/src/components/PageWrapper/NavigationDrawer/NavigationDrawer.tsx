import CampaignIcon from '@mui/icons-material/Campaign'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import LinkIcon from '@mui/icons-material/Link'
import ListIcon from '@mui/icons-material/List'
import Backdrop from '@mui/material/Backdrop'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { ReactElement } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'
import Youtube from '@core/shared/ui/icons/Youtube'

import { ListGroup } from './ListGroup'

const DRAWER_WIDTH = '237px'

interface NavigationDrawerProps {
  open?: boolean
  onClose?: (value: boolean) => void
  selectedPage?: string
}

export function NavigationDrawer({
  open,
  onClose,
  selectedPage
}: NavigationDrawerProps): ReactElement {
  function handleClose(): void {
    onClose?.(open !== true)
  }

  return (
    <Drawer
      open
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
          textWrap: 'nowrap',
          transition: (theme) => theme.transitions.create('width'),
          width: open === true ? DRAWER_WIDTH : { xs: 0, md: 72 }
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
          aria-label="Navigation Drawer Toggle"
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
        <ListGroup name="Youtube" icon={<Youtube />} drawerOpen={open}>
          <Link href="/resources" legacyBehavior>
            <ListItemButton selected={selectedPage === 'resources'}>
              <ListItemIcon>
                <LibraryBooksIcon />
              </ListItemIcon>
              <ListItemText primary="Resources" />
            </ListItemButton>
          </Link>
          <Link href="/channels" legacyBehavior>
            <ListItemButton selected={selectedPage === 'channels'}>
              <ListItemIcon>
                <CampaignIcon />
              </ListItemIcon>
              <ListItemText primary="Channels" />
            </ListItemButton>
          </Link>
          <Link href="/batches" legacyBehavior>
            <ListItemButton selected={selectedPage === 'batches'}>
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="Batch Jobs" />
            </ListItemButton>
          </Link>
          <Link href="/short-links" legacyBehavior>
            <ListItemButton selected={selectedPage === 'short-links'}>
              <ListItemIcon>
                <LinkIcon />
              </ListItemIcon>
              <ListItemText primary="Short Links" />
            </ListItemButton>
          </Link>
        </ListGroup>
        <Link href="/videos" legacyBehavior>
          <ListItemButton selected={selectedPage === 'videos'}>
            <ListItemIcon>
              <VideoOnIcon />
            </ListItemIcon>
            <ListItemText primary="Videos" />
          </ListItemButton>
        </Link>
        <ListItem component="div" sx={{ flexGrow: '1 !important' }} />
        <Typography
          variant="h6"
          sx={{
            color: 'primary.main',
            textAlign: 'center',
            pb: 1
          }}
        >
          {open === true ? 'Nexus' : 'N'}
        </Typography>
      </List>
    </Drawer>
  )
}

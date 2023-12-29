import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import CampaignIcon from '@mui/icons-material/Campaign'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import ListIcon from '@mui/icons-material/List'
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC, ReactElement, useState } from 'react'

interface SidebarLink {
  id: number
  name: string
  slug: string
  icon: ReactElement
}

export const Sidebar: FC = () => {
  const pathname = usePathname()
  const [miniVariant, setMiniVariant] = useState<boolean>(false)
  const drawerWidth = 240
  const miniDrawerWidth = 56

  const sidebarLinks: SidebarLink[] = [
    {
      id: 1,
      name: 'Resources',
      slug: '/resources',
      icon: (
        <LibraryBooksIcon
          sx={{
            color: pathname === '/resources' ? 'primary.main' : '#fff'
          }}
        />
      )
    },
    {
      id: 2,
      name: 'Channels',
      slug: '/channels',
      icon: (
        <CampaignIcon
          sx={{
            color: pathname === '/channels' ? 'primary.main' : '#fff'
          }}
        />
      )
    },
    {
      id: 3,
      name: 'Batch Jobs',
      slug: '/jobs',
      icon: (
        <ListIcon
          sx={{
            color: pathname === '/jobs' ? 'primary.main' : '#fff'
          }}
        />
      )
    }
  ]

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: miniVariant ? miniDrawerWidth : drawerWidth,
        whiteSpace: 'nowrap'
      }}
      PaperProps={{
        sx: {
          width: miniVariant ? miniDrawerWidth : drawerWidth,
          overflowX: 'hidden',
          transition: 'width 0.2s',
          color: '#fff',
          backgroundColor: '#26262E',
          py: 6,
          px: miniVariant ? 1 : 6
        }
      }}
    >
      <Stack alignItems={miniVariant ? 'center' : 'flex-start'}>
        <IconButton onClick={() => setMiniVariant(!miniVariant)}>
          {miniVariant ? (
            <ArrowCircleRightIcon
              sx={{
                color: '#F6F5F6'
              }}
            />
          ) : (
            <ArrowCircleLeftIcon
              sx={{
                color: '#F6F5F6'
              }}
            />
          )}
        </IconButton>
      </Stack>
      <Divider sx={{ my: '8px' }} />
      <List dense>
        {sidebarLinks.map((sidebarLink) => (
          <ListItem disablePadding key={sidebarLink.id}>
            <ListItemButton
              LinkComponent={Link}
              href={sidebarLink.slug}
              sx={{
                px: miniVariant ? '12px' : '16px'
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: miniVariant ? 0 : 4
                }}
              >
                {sidebarLink.icon}
              </ListItemIcon>
              {!miniVariant && (
                <ListItemText
                  primary={sidebarLink.name}
                  sx={{
                    color:
                      pathname === sidebarLink.slug ? 'primary.main' : '#fff'
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Typography
        sx={{
          fontFamily: 'Montserrat',
          textTransform: 'capitalize',
          fontWeight: 700,
          fontSize: '16px',
          color: '#EF3344',
          mt: 'auto',
          textAlign: 'center'
        }}
      >
        {miniVariant ? 'N' : 'Nexus'}
      </Typography>
    </Drawer>
  )
}

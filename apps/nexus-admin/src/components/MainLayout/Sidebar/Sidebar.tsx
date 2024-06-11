import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import CampaignIcon from '@mui/icons-material/Campaign'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import LinkIcon from '@mui/icons-material/Link'
import ListIcon from '@mui/icons-material/List'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
            color: pathname.includes('/resources') ? 'primary.main' : '#fff'
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
            color: pathname.includes('/channels') ? 'primary.main' : '#fff'
          }}
        />
      )
    },
    {
      id: 3,
      name: 'Batch Jobs',
      slug: '/batches',
      icon: (
        <ListIcon
          sx={{
            color: pathname.includes('/batches') ? 'primary.main' : '#fff'
          }}
        />
      )
    },
    {
      id: 4,
      name: 'Short Links',
      slug: '/short-links',
      icon: (
        <LinkIcon
          sx={{
            color: pathname.includes('/short-links') ? 'primary.main' : '#fff'
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
        whiteSpace: 'nowrap',
        zIndex: 1000
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
                    color: pathname.includes(sidebarLink.slug)
                      ? 'primary.main'
                      : '#fff'
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
      <Typography
        variant="caption"
        component="a"
        href="https://www.jesusfilm.org/privacy"
        target="_blank"
        sx={{
          textAlign: 'center',
          color: 'inherit',
          mt: 2
        }}
      >
        Privacy Policy
      </Typography>
    </Drawer>
  )
}

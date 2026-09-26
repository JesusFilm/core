import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

import { useShortLinkAccess } from '../../libs/useShortLinkAccess'

interface Item {
  text: string
  icon: ReactNode
  href: string
}

function isItemSelected(item: Item, pathname: string | null): boolean {
  if (pathname == null) return false
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function MenuContent(): ReactElement {
  const pathname = usePathname()
  const { isAdmin } = useShortLinkAccess()

  const mainListItems: Item[] = [
    { text: 'Links', icon: <LinkRoundedIcon />, href: '/links' },
    { text: 'Campaigns', icon: <CampaignRoundedIcon />, href: '/campaigns' },
    ...(isAdmin
      ? [{ text: 'Domains', icon: <LanguageRoundedIcon />, href: '/domains' }]
      : [])
  ]

  const secondaryListItems: Item[] = [
    { text: 'Test Redirect', icon: <ScienceRoundedIcon />, href: '/test' }
  ]

  return (
    <Stack
      sx={{
        flexGrow: 1,
        p: 1,
        justifyContent: 'space-between'
      }}
    >
      <List dense>
        {mainListItems.map((item) => (
          <ListItem key={item.href} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              LinkComponent={Link}
              href={item.href}
              selected={isItemSelected(item, pathname)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item) => (
          <ListItem key={item.href} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              LinkComponent={Link}
              href={item.href}
              selected={isItemSelected(item, pathname)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}

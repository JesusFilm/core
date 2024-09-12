import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement, ReactNode } from 'react'

interface Item {
  text: string
  icon: ReactNode
  href: string
  startsWith?: boolean
}

export function MenuContent(): ReactElement {
  const t = useTranslations()
  const params = useParams()
  const pathname = usePathname()

  const mainListItems: Item[] = [
    {
      text: t('Home'),
      icon: <HomeRoundedIcon />,
      href: `/${params?.locale?.toString() ?? 'en'}`
    },
    {
      text: t('Video Library'),
      icon: <VideoLibraryRoundedIcon />,
      href: `/${params?.locale?.toString() ?? 'en'}/videos`,
      startsWith: true
    }
  ]

  const secondaryListItems: Item[] = [
    {
      text: t('Settings'),
      icon: <SettingsRoundedIcon />,
      href: `/${params?.locale?.toString() ?? 'en'}/settings`,
      startsWith: true
    }
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
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              LinkComponent={Link}
              href={item.href}
              selected={
                pathname === item.href ||
                (item.startsWith === true && pathname?.startsWith(item.href))
              }
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              LinkComponent={Link}
              href={item.href}
              selected={
                pathname === item.href ||
                (item.startsWith === true && pathname?.startsWith(item.href))
              }
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

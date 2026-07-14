import { gql, useQuery } from '@apollo/client'
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

export const GET_NAVIGATION_ROLES = gql`
  query GetNavigationRoles {
    me {
      id
      __typename
      ... on AuthenticatedUser {
        mediaUserRoles
        languageUserRoles
      }
    }
  }
`

export interface NavigationRolesData {
  me?: {
    __typename?: string
    mediaUserRoles?: string[]
    languageUserRoles?: string[]
  } | null
}

interface Item {
  text: string
  icon: ReactNode
  href: string
  startsWith?: boolean
  excludedStartsWith?: string[]
}

export function MenuContent(): ReactElement {
  const pathname = usePathname()
  const { data } = useQuery<NavigationRolesData>(GET_NAVIGATION_ROLES)
  const mediaUserRoles = data?.me?.mediaUserRoles ?? []
  const languageUserRoles = data?.me?.languageUserRoles ?? []
  const hasMediaAccess = mediaUserRoles.includes('publisher')
  const hasLanguageAccess = languageUserRoles.includes('publisher')

  const mainListItems: Item[] = [
    ...(hasMediaAccess
      ? [
          {
            text: 'Video Library',
            icon: <VideoLibraryRoundedIcon />,
            href: '/videos',
            startsWith: true,
            excludedStartsWith: ['/videos/algolia-debugging']
          },
          {
            text: 'Algolia Debugging',
            icon: <BugReportRoundedIcon />,
            href: '/videos/algolia-debugging',
            startsWith: true
          }
        ]
      : []),
    ...(hasLanguageAccess
      ? [
          {
            text: 'Language Admin',
            icon: <TranslateRoundedIcon />,
            href: '/languages',
            startsWith: true
          }
        ]
      : [])
  ]

  const secondaryListItems: Item[] = hasMediaAccess
    ? [
        {
          text: 'Settings',
          icon: <SettingsRoundedIcon />,
          href: '/settings',
          startsWith: true
        }
      ]
    : []

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
                (item.startsWith === true &&
                  pathname?.startsWith(item.href) &&
                  item.excludedStartsWith?.some((excludedPath) =>
                    pathname.startsWith(excludedPath)
                  ) !== true)
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
                (item.startsWith === true &&
                  pathname?.startsWith(item.href) &&
                  item.excludedStartsWith?.some((excludedPath) =>
                    pathname.startsWith(excludedPath)
                  ) !== true)
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

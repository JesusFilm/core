import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded'
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactElement, ReactNode } from 'react'

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: theme.palette.action.disabled,
    margin: 1
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center'
  }
}))

interface Label {
  value: string
  icon?: ReactNode
}

export function NavbarBreadcrumbs(): ReactElement {
  const paths = usePathname()
  const pathNames = paths?.split('/').filter((path) => path) ?? []

  const labels: { [key: string]: Label } = {
    videos: {
      icon: <VideoLibraryRoundedIcon fontSize="inherit" />,
      value: 'Video Library'
    },
    settings: {
      icon: <SettingsRoundedIcon fontSize="inherit" />,
      value: 'Settings'
    }
  }

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      data-testid="NavBarBreadcrumbs"
    >
      {pathNames.length === 0 ? (
        <Typography
          variant="body1"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.primary',
            fontWeight: 600,
            gap: 0.5
          }}
        >
          <HomeRoundedIcon fontSize="inherit" />
          Dashboard
        </Typography>
      ) : (
        pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join('/')}`
          const itemLink = labels[link] ?? {
            value: link[0].toUpperCase() + link.slice(1, link.length)
          }
          return index + 1 < pathNames.length ? (
            <MuiLink
              component={Link}
              href={href}
              key={index}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {itemLink.icon}
              {itemLink.value}
            </MuiLink>
          ) : (
            <Typography
              key={index}
              variant="body1"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontWeight: 600,
                gap: 0.5
              }}
            >
              {itemLink.icon}
              {itemLink.value}
            </Typography>
          )
        })
      )}
    </StyledBreadcrumbs>
  )
}

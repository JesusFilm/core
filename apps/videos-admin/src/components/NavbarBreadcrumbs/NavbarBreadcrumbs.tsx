import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

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

export function NavbarBreadcrumbs(): ReactElement {
  const t = useTranslations()
  const paths = usePathname()
  const pathNames = paths?.split('/').filter((path) => path) ?? []
  const params = useParams()

  const labels = {
    [params?.locale.toString() ?? 'en']: t('Dashboard'),
    videos: t('Video Library'),
    settings: t('Settings')
  }

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {pathNames.map((link, index) => {
        const href = `/${pathNames.slice(0, index + 1).join('/')}`
        const itemLink =
          labels[link] ?? link[0].toUpperCase() + link.slice(1, link.length)
        return index + 1 < pathNames.length ? (
          <MuiLink component={Link} href={href} key={index}>
            {itemLink}
          </MuiLink>
        ) : (
          <Typography
            variant="body1"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {itemLink}
          </Typography>
        )
      })}
    </StyledBreadcrumbs>
  )
}

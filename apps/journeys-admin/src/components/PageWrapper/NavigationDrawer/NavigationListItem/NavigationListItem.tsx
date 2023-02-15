import { ReactElement } from 'react'
import NextLink from 'next/link'
import Tooltip from '@mui/material/Tooltip'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'

export interface NavigationListItemProps {
  icon: ReactElement
  label: string
  selected: boolean
  link?: string
  handleClick?: (e?) => void
  notification?: boolean
  tooltipText?: string
}

export function NavigationListItem({
  icon,
  label,
  selected,
  link,
  handleClick,
  notification = false,
  tooltipText
}: NavigationListItemProps): ReactElement {
  const color = selected ? 'background.paper' : 'secondary.light'

  const wrappedNavListItem = linkWrapper({ link })({
    tooltipText,
    notification,
    children: (
      <ListItemButton
        onClick={handleClick}
        aria-selected={selected}
        data-testid={`${label}-list-item`}
      >
        <Badge
          variant="dot"
          color="warning"
          overlap="circular"
          invisible={!notification}
          data-testid="nav-notification-badge"
          sx={{
            '& .MuiBadge-badge': {
              right: '32%',
              top: '10%'
            }
          }}
        >
          <ListItemIcon sx={{ color }}>{icon}</ListItemIcon>
        </Badge>
        <ListItemText primary={label} sx={{ color }} />
      </ListItemButton>
    )
  })
  return <>{wrappedNavListItem}</>
}

interface LinkWrapperProps {
  link?: string
}

interface TooltipTextWrapperProps {
  tooltipText?: string
  notification: boolean
  children: ReactElement
}

const linkWrapper = ({
  link
}: LinkWrapperProps): (({
  tooltipText,
  notification,
  children
}: TooltipTextWrapperProps) => ReactElement) => {
  if (link != null) {
    return function tooltipTextWrapper({
      tooltipText,
      notification,
      children
    }): ReactElement {
      if (tooltipText != null && notification) {
        return (
          <NextLink href={link} passHref>
            <Tooltip title={tooltipText ?? ''} placement="right" arrow>
              {children}
            </Tooltip>
          </NextLink>
        )
      } else {
        return (
          <NextLink href={link} passHref>
            {children}
          </NextLink>
        )
      }
    }
  } else {
    return function tooltipTextWrapper({
      tooltipText,
      notification,
      children
    }): ReactElement {
      if (tooltipText != null && notification) {
        return (
          <Tooltip title={tooltipText ?? ''} placement="right" arrow>
            {children}
          </Tooltip>
        )
      } else {
        return <>{children}</>
      }
    }
  }
}

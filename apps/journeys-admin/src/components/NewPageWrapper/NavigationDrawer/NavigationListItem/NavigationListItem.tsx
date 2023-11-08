import Badge from '@mui/material/Badge'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import flowRight from 'lodash/flowRight'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement } from 'react'

export interface NavigationListItemProps {
  icon: ReactElement
  label: string
  selected: boolean
  link?: string
  handleClick?: MouseEventHandler<HTMLDivElement> | undefined
  tooltipText?: string
}

export function NavigationListItem({
  icon,
  label,
  selected,
  link,
  handleClick,
  tooltipText
}: NavigationListItemProps): ReactElement {
  const color = selected ? 'background.paper' : 'secondary.light'
  const ListItem: ReactElement = (
    <ListItemButton
      onClick={handleClick}
      aria-selected={selected}
      data-testid={`${label}-list-item`}
    >
      <Badge
        variant="dot"
        color="warning"
        overlap="circular"
        invisible={tooltipText == null}
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
  const enhance = flowRight(withLink(link), withTooltip(tooltipText))
  const WrappedNavListItem = enhance(ListItem)

  return WrappedNavListItem
}

const withLink = (link: string | undefined) =>
  function component(baseComponent: ReactElement) {
    if (link != null) {
      return (
        <NextLink href={link} passHref legacyBehavior>
          {baseComponent}
        </NextLink>
      )
    } else {
      return baseComponent
    }
  }

const withTooltip = (tooltip: string | undefined) =>
  function component(baseComponent: ReactElement) {
    if (tooltip != null) {
      return (
        <Tooltip title={tooltip} placement="right" arrow>
          {baseComponent}
        </Tooltip>
      )
    } else {
      return baseComponent
    }
  }

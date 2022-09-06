import { ReactElement } from 'react'
import NextLink from 'next/link'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

export interface NavigationListItemProps {
  icon: ReactElement
  text: string
  selected: boolean
  link?: string
  handleClick?: (e?) => void
}

export function NavigationListItem({
  icon,
  text,
  selected,
  link,
  handleClick
}: NavigationListItemProps): ReactElement {
  const color = selected ? 'background.paper' : 'secondary.light'
  return (
    <LinkWrapper
      wrapper={(children) => (
        <NextLink href={link as string} passHref>
          {children}
        </NextLink>
      )}
      condition={link}
    >
      <ListItemButton onClick={handleClick}>
        <ListItemIcon sx={{ color }}>{icon}</ListItemIcon>
        <ListItemText primary={text} sx={{ color }} />
      </ListItemButton>
    </LinkWrapper>
  )
}

interface LinkWrapperProps {
  wrapper: (children: ReactElement) => ReactElement
  children: ReactElement
  condition?: string
}

const LinkWrapper = ({
  wrapper,
  children,
  condition
}: LinkWrapperProps): ReactElement =>
  condition != null ? wrapper(children) : children

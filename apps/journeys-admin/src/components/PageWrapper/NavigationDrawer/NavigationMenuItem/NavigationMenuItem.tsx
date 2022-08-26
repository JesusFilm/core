import { ReactElement } from 'react'
import Link from 'next/link'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

export interface NavigationMenuItemProps {
  icon: ReactElement
  text: string
  color: string
  link?: string
  handleClick?: (e?) => void
}

export function NavigationMenuItem({
  icon,
  text,
  color,
  link,
  handleClick
}: NavigationMenuItemProps): ReactElement {
  return (
    <>
      <LinkWrapper
        wrapper={(children) => (
          <Link href={link as string} passHref>
            {children}
          </Link>
        )}
        condition={link}
      >
        <ListItemButton onClick={handleClick}>
          <ListItemIcon
            sx={{
              color
            }}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={text}
            sx={{
              color
            }}
          />
        </ListItemButton>
      </LinkWrapper>
    </>
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

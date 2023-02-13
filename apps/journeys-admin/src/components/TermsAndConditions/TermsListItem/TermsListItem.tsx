import NextLink from 'next/link'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import { ReactElement } from 'react'
import ListItemText from '@mui/material/ListItemText'

export interface TermsListItemProps {
  link: string
  icon: ReactElement
  text: string
}

export function TermsListItem({
  link,
  icon,
  text
}: TermsListItemProps): ReactElement {
  return (
    <ListItem disablePadding>
      <NextLink href={link} passHref>
        <ListItemButton sx={{ pt: 3, pb: 3 }}>
          <ListItemIcon sx={{ minWidth: '44px' }}>{icon}</ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body1" color="primary.main">
                {text}
              </Typography>
            }
          />
        </ListItemButton>
      </NextLink>
    </ListItem>
  )
}

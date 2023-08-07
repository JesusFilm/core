import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

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
    <ListItemButton
      href={link}
      sx={{ pt: 3, pb: 3 }}
      target="_blank"
      rel="noopener"
    >
      <ListItemIcon sx={{ minWidth: 44 }}>{icon}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body1" color="primary.main">
            {text}
          </Typography>
        }
      />
    </ListItemButton>
  )
}

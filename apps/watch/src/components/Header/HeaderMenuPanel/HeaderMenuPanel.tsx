import { ReactElement } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListIcon from '@mui/icons-material/List'
import Box from '@mui/material/Box'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

interface HeaderMenuPanelProps {
  toggleMenuPanel: (anchor: string, open: boolean) => void
}

export function HeaderMenuPanel({
  toggleMenuPanel
}: HeaderMenuPanelProps): ReactElement {
  const menuItems = ['About', 'Contact', 'Collections']

  return (
    <Box
      sx={{ width: '240px' }}
      role="presentation"
      onClick={() => toggleMenuPanel('left', false)}
      onKeyDown={() => toggleMenuPanel('left', false)}
    >
      <List>
        {menuItems.map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index % 2 === 0 ? <PlayArrowIcon /> : <ListIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

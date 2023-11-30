import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'
import CampaignIcon from '@mui/icons-material/Campaign'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import ListIcon from '@mui/icons-material/List'
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList
} from '@mui/material'
import { FC } from 'react'

export const Sidebar: FC = () => {
  return (
    <Box
      sx={{
        color: '#fff',
        backgroundColor: '#26262E',
        width: '240px',
        height: '100vh',
        p: 6
      }}
    >
      <IconButton>
        <ArrowCircleRightIcon
          sx={{
            color: '#F6F5F6'
          }}
        />
      </IconButton>
      <Divider sx={{ my: '16px' }} />
      <MenuList dense>
        <MenuItem disableRipple>
          <ListItemIcon>
            <LibraryBooksIcon
              sx={{
                color: '#fff'
              }}
            />
          </ListItemIcon>
          <ListItemText>Resources</ListItemText>
        </MenuItem>
        <MenuItem disableRipple>
          <ListItemIcon>
            <CampaignIcon
              sx={{
                color: '#fff'
              }}
            />
          </ListItemIcon>
          <ListItemText>Channels</ListItemText>
        </MenuItem>
        <MenuItem disableRipple>
          <ListItemIcon>
            <ListIcon
              sx={{
                color: '#fff'
              }}
            />
          </ListItemIcon>
          <ListItemText>Batch Jobs</ListItemText>
        </MenuItem>
      </MenuList>
    </Box>
  )
}

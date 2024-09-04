import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded'
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded'
import SmartphoneRoundedIcon from '@mui/icons-material/SmartphoneRounded'
import MuiAvatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MuiListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent, selectClasses } from '@mui/material/Select'
import { styled } from '@mui/material/styles'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`
}))

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12
})

export function SelectContent(): ReactElement {
  const t = useTranslations()
  const [company, setCompany] = useState('')

  const handleChange = (event: SelectChangeEvent): void => {
    setCompany(event.target.value)
  }

  return (
    <Select
      labelId="company-select"
      id="company-simple-select"
      value={company}
      onChange={handleChange}
      displayEmpty
      inputProps={{ 'aria-label': 'Select company' }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 215,
        '&.MuiList-root': {
          p: '8px'
        },
        [`& .${selectClasses.select}`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          pl: 1
        }
      }}
    >
      <ListSubheader sx={{ pt: 0 }}>{t('Production')}</ListSubheader>
      <MenuItem value="">
        <ListItemAvatar>
          <Avatar alt="Sitemark web">
            <DevicesRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-web" secondary="Web app" />
      </MenuItem>
      <MenuItem value={10}>
        <ListItemAvatar>
          <Avatar alt="Sitemark App">
            <SmartphoneRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-app" secondary="Mobile application" />
      </MenuItem>
      <MenuItem value={20}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <DevicesRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-Store" secondary="Web app" />
      </MenuItem>
      <ListSubheader>{t('Development')}</ListSubheader>
      <MenuItem value={30}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <ConstructionRoundedIcon sx={{ fontSize: '1rem' }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Sitemark-Admin" secondary="Web app" />
      </MenuItem>
      <Divider sx={{ mx: -1 }} />
      <MenuItem value={40}>
        <ListItemIcon>
          <AddRoundedIcon />
        </ListItemIcon>
        <ListItemText primary="Add product" secondary="Web app" />
      </MenuItem>
    </Select>
  )
}

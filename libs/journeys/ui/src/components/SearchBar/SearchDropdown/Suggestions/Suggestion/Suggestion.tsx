import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

export enum SuggestionVariant {
  LANGUAGE = 'Language',
  TAG = 'Tag'
}

interface SuggestionProps {
  query?: string
  filters?: string[]
  variant?: SuggestionVariant
  handleClick: () => void
}

export function Suggestion({
  query = 'Jesus',
  filters = ['English', 'Spanish'],
  variant = SuggestionVariant.LANGUAGE,
  handleClick
}: SuggestionProps): ReactElement {
  const filtersLabel = filters.join(' and ')
  const label = `${query} in ${filtersLabel}`

  return (
    <MenuItem
      sx={{ p: 3, borderRadius: 3 }}
      value={label}
      onClick={handleClick}
    >
      <ListItemIcon>
        <Globe1Icon />
      </ListItemIcon>
      <ListItemText>
        <Typography display="inline" fontWeight="1000">
          {query}
        </Typography>
        <Typography display="inline">{` - in ${filtersLabel}`}</Typography>
      </ListItemText>
      <Typography
        variant="body1"
        color="text.secondary"
        ml={6}
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {variant}
      </Typography>
    </MenuItem>
  )
}
import ListItemIcon from '@mui/material/ListItemIcon'
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
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold'
        }}
      >
        {query}
      </Typography>
      <Typography
        variant="h6"
        noWrap
        sx={{
          pl: 1
        }}
      >{`- in ${filtersLabel}`}</Typography>
      <Typography
        variant="h6"
        sx={{
          color: 'text.secondary',
          ml: 'auto',
          display: { xs: 'none', md: 'block' }
        }}
      >
        {variant}
      </Typography>
    </MenuItem>
  )
}

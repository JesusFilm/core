import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import Chip from '@mui/material/Chip'
import { noop } from 'lodash'

export function CurrentFilters(): ReactElement {
  return (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      <Button startIcon={<FilterListRoundedIcon />}>Filters</Button>
      <Chip label="English" onDelete={noop} />
    </Stack>
  )
}

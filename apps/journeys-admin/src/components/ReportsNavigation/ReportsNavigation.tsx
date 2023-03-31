import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { NavigationButton } from './NavigationButton'

interface Props {
  selected: 'journeys' | 'visitors'
}

export function ReportsNavigation({ selected }: Props): ReactElement {
  return (
    <Stack direction="row" spacing={4} sx={{ pb: 6 }}>
      <NavigationButton
        selected={selected === 'journeys'}
        value="Journeys"
        link="/reports/journeys"
      />
      <NavigationButton
        selected={selected === 'visitors'}
        value="Visitors"
        link="/reports/visitors"
      />
    </Stack>
  )
}

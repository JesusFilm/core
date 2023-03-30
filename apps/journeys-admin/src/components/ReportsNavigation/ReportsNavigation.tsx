import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import NextLink from 'next/link'
import { ReactElement } from 'react'

interface Props {
  selected: 'journeys' | 'visitors'
}

export function ReportsNavigation({ selected }: Props): ReactElement {
  return (
    <Stack direction="row" spacing={4} sx={{ p: 4 }}>
      <NextLink href="/reports/journeys" passHref>
        <Button variant={selected === 'journeys' ? 'contained' : 'outlined'}>
          Journeys
        </Button>
      </NextLink>
      <NextLink href="/reports/visitors" passHref>
        <Button variant={selected === 'visitors' ? 'contained' : 'outlined'}>
          Visitors
        </Button>
      </NextLink>
    </Stack>
  )
}

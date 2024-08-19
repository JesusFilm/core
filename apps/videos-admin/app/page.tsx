import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export default function Index(): ReactElement {
  return (
    <Stack justifyContent="center" alignItems="center" minHeight="100vh">
      <Stack>
        <Typography variant="h1">Hello World!</Typography>
      </Stack>
    </Stack>
  )
}

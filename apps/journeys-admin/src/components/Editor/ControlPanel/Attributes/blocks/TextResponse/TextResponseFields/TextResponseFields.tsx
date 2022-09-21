import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { Label } from './Label'
import { Hint } from './Hint'

export function TextResponseFields(): ReactElement {
  return (
    <Stack sx={{ px: 6, py: 4 }}>
      <Label />
      <Hint />
    </Stack>
  )
}

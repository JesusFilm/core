import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { Label } from './Label'
import { Hint } from './Hint'
import { MinRows } from './MinRows'

export function TextResponseFields(): ReactElement {
  return (
    <Stack>
      <Label />
      <Hint />
      <MinRows />
    </Stack>
  )
}

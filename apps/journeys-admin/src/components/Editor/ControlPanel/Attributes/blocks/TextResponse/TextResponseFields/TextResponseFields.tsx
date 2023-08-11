import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { Hint } from './Hint'
import { Label } from './Label'
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

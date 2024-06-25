import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { Hint } from './Hint'
import { Label } from './Label'
import { MinRows } from './MinRows'
import { Type } from './Type'

export function TextResponseFields(): ReactElement {
  return (
    <Stack data-testid="TextResponseFields">
      <Label />
      <Hint />
      <MinRows />
      <Type />
    </Stack>
  )
}

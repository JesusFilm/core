import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { GrowthSpacesIntegrations } from './GrowthSpacesIntegrations'
import { Hint } from './Hint'
import { Label } from './Label'
import { MinRows } from './MinRows'
import { Placeholder } from './Placeholder'
import { Type } from './Type'

export function TextResponseFields(): ReactElement {
  return (
    <Stack data-testid="TextResponseFields">
      <Label />
      <Placeholder />
      <Hint />
      <MinRows />
      <Type />
      <GrowthSpacesIntegrations />
    </Stack>
  )
}

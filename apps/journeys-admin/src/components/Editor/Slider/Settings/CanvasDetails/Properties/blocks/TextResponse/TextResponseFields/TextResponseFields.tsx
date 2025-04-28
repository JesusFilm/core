import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { GrowthSpacesIntegrations } from './GrowthSpacesIntegrations'
import { Hint } from './Hint'
import { Label } from './Label'
import { MinRows } from './MinRows'
import { Placeholder } from './Placeholder'
import { Required } from './Required'
import { Type } from './Type'

export function TextResponseFields(): ReactElement {
  return (
    <Stack data-testid="TextResponseFields">
      <Required />
      <Label />
      <Placeholder />
      <Hint />
      <Type />
      <MinRows />
      <GrowthSpacesIntegrations />
    </Stack>
  )
}

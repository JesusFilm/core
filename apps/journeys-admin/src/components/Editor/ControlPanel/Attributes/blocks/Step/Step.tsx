import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material'
import { Attribute } from '../..'

export function Step({ locked }: TreeBlock<StepBlock>): ReactElement {
  return (
    <Attribute
      icon={locked ? <LockIcon /> : <LockOpenIcon />}
      name="Next Card"
      value={'Card Title'}
      description={locked ? 'Locked With Interaction' : 'Unlocked Card'}
    />
  )
}

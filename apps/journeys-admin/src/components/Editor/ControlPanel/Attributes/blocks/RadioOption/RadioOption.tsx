import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourney'
import { Attribute } from '../..'

export function RadioOption({
  id,
  label,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-radio-option-action`}
        icon={<LinkRoundedIcon />}
        name="Action"
        value={action?.__typename.toString() ?? 'None'}
        description="Action"
        // onClick to open drawer
      />
    </>
  )
}

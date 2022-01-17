import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import ArrowDropDownCircleRoundedIcon from '@mui/icons-material/ArrowDropDownCircleRounded'
import { GetJourneyForEdit_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Attribute } from '../..'

export function RadioOption({
  id,
  label,
  action
}: TreeBlock<RadioOptionBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-radio-option-label`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Label"
        value={label}
        description="Radio Option Label"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-radio-option-action`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Action"
        value={action?.__typename.toString() ?? 'None'}
        description="Radio Option Action"
        // onClick to open drawer
      />
    </>
  )
}
